import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Input from '../ui/Input';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { CheckIcon, XIcon, PlusIcon, TrashIcon, Settings2 } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacters';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { UpdateCharacterData, StatusConfigType } from '@/types/character';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const updateCharacterSchema = z.object({
  name: z.string().min(1, '请输入角色名称'),
  bio: z.string().max(500, '简介最多500字').optional(),
  avatar: z.string().url('请输入有效的URL地址').optional().or(z.literal('')),
  qqNumber: z.string().regex(/^\d{5,11}$/, 'QQ号格式不正确').optional().or(z.literal('')),
});

type UpdateCharacterFormData = z.infer<typeof updateCharacterSchema>;


export const CharacterDetail: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { character, isLoading, error, silentRefetch } = useCharacter(uid!);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [statusConfig, setStatusConfig] = useState<StatusConfigType>({ vital_signs: {} });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [newStatusKey, setNewStatusKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateCharacterFormData>({
    resolver: zodResolver(updateCharacterSchema),
  });

  const qqNumber = watch('qqNumber');
  const avatarUrl = watch('avatar');

  // 当QQ号变化时更新预览
  React.useEffect(() => {
    if (qqNumber && /^\d{5,11}$/.test(qqNumber)) {
      const url = `https://q.qlogo.cn/headimg_dl?dst_uin=${qqNumber}&spec=640&img_type=jpg`;
      setPreviewAvatar(url);
      setValue('avatar', url);
    }
  }, [qqNumber, setValue]);

  // 当头像URL变化时更新预览
  React.useEffect(() => {
    if (avatarUrl) {
      setPreviewAvatar(avatarUrl);
    } else {
      setPreviewAvatar(null);
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (character) {
      setStatusConfig({
        vital_signs: {},
        display: {
          default_message: '状态良好',
          timeout_messages: []
        },
        ...character.status_config
      });
    } else {
      setStatusConfig({
        vital_signs: {},
        display: {
          default_message: '状态良好',
          timeout_messages: []
        }
      });
    }
  }, [character]);

  const handleShowSecretKey = async () => {
    try {
      const key = await characterService.getSecretKey(uid!);
      setSecretKey(key);
      await navigator.clipboard.writeText(key);
      toast.success("密钥已复制到剪贴板");
    } catch (err) {
      setUpdateError(formatError(err));
      toast.error("获取密钥失败");
    }
  };

  const handleRegenerateSecretKey = async () => {
    try {
      setIsRegeneratingKey(true);
      const key = await characterService.regenerateSecretKey(uid!);
      setSecretKey(key);
      await navigator.clipboard.writeText(key);
      toast.success("新密钥已生成并复制到剪贴板");
    } catch (err) {
      setUpdateError(formatError(err));
      toast.error("重新生成密钥失败");
    } finally {
      setIsRegeneratingKey(false);
      setShowRegenerateConfirm(false);
    }
  };

  const handleRemoveStatusField = async (category: keyof StatusConfigType, key: string) => {
    if (category === 'vital_signs') {
      const currentFields = { ...(statusConfig.vital_signs || {}) };
      delete currentFields[key];
      
      const newConfig = {
        ...statusConfig,
        vital_signs: currentFields
      };
      
      setStatusConfig(newConfig);
      await handleStatusConfigUpdate(newConfig);
    }
  };

  const handleAddStatusField = (category: keyof StatusConfigType) => {
    if (category === 'vital_signs') {
      const newKey = `status_${Object.keys(statusConfig.vital_signs || {}).length + 1}`;
      setNewStatusKey(newKey);
    }
  };

  const handleSaveNewStatus = async (newStatus: any) => {
    if (!newStatusKey) return;
    
    setStatusConfig({
      ...statusConfig,
      vital_signs: {
        ...(statusConfig.vital_signs || {}),
        [newStatusKey]: newStatus
      }
    });
    setNewStatusKey(null);
  };

  const handleStatusConfigUpdate = async (newConfig: StatusConfigType) => {
    if (!character) return;
    
    try {
      console.log('Attempting to save status config:', newConfig);
      setIsSaving(true);
      await characterService.update(uid!, { 
        name: character.name,
        status_config: newConfig
      });
      console.log('Status config saved successfully');
      await silentRefetch();
    } catch (err) {
      console.error('Error saving status config:', err);
      setUpdateError(formatError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: UpdateCharacterFormData) => {
    try {
      setIsSaving(true);
      setUpdateError(null);
      
      const updateData: UpdateCharacterData = {
        name: data.name,
        bio: data.bio,
        avatar: data.avatar
      };
      
      await characterService.update(uid!, updateData);
      setIsEditing(false);
      await silentRefetch();
    } catch (err) {
      setUpdateError(formatError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await characterService.delete(uid!);
      navigate('/characters');
    } catch (err) {
      setUpdateError(formatError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="text-center text-red-500 p-4">
        {error || '角色不存在'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">角色详情</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/characters')}
          >
            返回列表
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '取消编辑' : '编辑'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt={character.name}
                  className="w-24 h-24 rounded-full object-cover"
                  onError={() => setPreviewAvatar(null)}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-500">
                    {character.name[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">QQ号</label>
                    <Input
                      type="text"
                      placeholder="输入QQ号自动获取头像"
                      {...register('qqNumber')}
                      error={errors.qqNumber?.message}
                    />
                    <p className="text-xs text-gray-500">
                      输入QQ号自动获取头像
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">头像URL</label>
                    <Input
                      type="text"
                      placeholder="https://example.com/avatar.jpg"
                      {...register('avatar')}
                      error={errors.avatar?.message}
                    />
                    <p className="text-xs text-gray-500">
                      也可以直接输入头像图片的URL地址
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">角色名称</label>
              <Input
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">简介</label>
              <Input
                {...register('bio')}
                error={errors.bio?.message}
              />
            </div>

            {updateError && (
              <div className="text-sm text-red-500">
                {updateError}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-500">
                    {character.name[0]}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{character.name}</h2>
                <p className="text-sm text-gray-500">
                  创建于 {new Date(character.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {character.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">简介</h3>
                <p className="mt-1">{character.bio}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">角色状态</h3>
              <div className="flex justify-center items-center space-x-2">
                <AnimatedSubscribeButton 
                  className="w-32 h-9"
                  subscribeStatus={character.is_active}
                  onClick={async () => {
                    try {
                      await characterService.updateStatus(uid!, !character.is_active);
                      await silentRefetch();
                    } catch (err) {
                      setUpdateError(formatError(err));
                    }
                  }}
                >
                  <span className="group inline-flex items-center">
                    <XIcon className="mr-2 size-4" />
                    已禁用
                  </span>
                  <span className="group inline-flex items-center">
                    <CheckIcon className="mr-2 size-4" />
                    已启用
                  </span>
                </AnimatedSubscribeButton>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                禁用后，角色展示页面将无法访问
              </p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">展示链接</h3>
              <div className="space-y-2">
                <div className="p-4 bg-gray-50 rounded-md">
                  {character.display_code ? (
                    <p className="font-mono text-sm break-all">
                      {`${import.meta.env.VITE_CHARACTER_DISPLAY_BASE_URL}/d/${character.display_code}`}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">展示链接未生成</p>
                  )}
                </div>
                <div className="space-x-2">
                  {character.display_code && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const url = `${import.meta.env.VITE_CHARACTER_DISPLAY_BASE_URL}/d/${character.display_code}`;
                        try {
                          await navigator.clipboard.writeText(url);
                          toast.success("展示链接已复制到剪贴板");
                        } catch (err) {
                          toast.error("复制链接失败");
                        }
                      }}
                    >
                      复制链接
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setIsSaving(true);
                        await characterService.regenerateDisplayCode(uid!);
                        await silentRefetch();
                        toast.success("展示链接已重新生成");
                      } catch (err) {
                        setUpdateError(formatError(err));
                        toast.error("重新生成链接失败");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                  >
                    重新生成链接
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">密钥管理</h3>
              <div className="space-y-2">
                {secretKey ? (
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="font-mono text-sm break-all">{secretKey}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">点击下方按钮查看或重新生成密钥</p>
                )}
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleShowSecretKey}
                    disabled={!!secretKey}
                  >
                    查看密钥
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRegenerateConfirm(true)}
                    disabled={isRegeneratingKey}
                  >
                    {isRegeneratingKey ? '生成中...' : '重新生成密钥'}
                  </Button>
                </div>
              </div>

              <Dialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>重新生成密钥</DialogTitle>
                    <DialogDescription>
                      重新生成密钥后，原有密钥将立即失效。此操作不可撤销，是否继续？
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowRegenerateConfirm(false)}
                    >
                      取消
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRegenerateSecretKey}
                      disabled={isRegeneratingKey}
                    >
                      {isRegeneratingKey ? '生成中...' : '确认重新生成'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">状态展示配置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 背景主题配置 */}
                <ThemeCard
                  theme={statusConfig?.theme}
                  config={statusConfig}
                  onUpdate={(theme) => {
                    setStatusConfig({
                      ...statusConfig,
                      theme
                    });
                  }}
                  onSave={async (config) => {
                    await handleStatusConfigUpdate(config);
                  }}
                  isSaving={isSaving}
                />

                {/* 状态显示配置 */}
                <DisplayConfigCard
                  config={statusConfig}
                  onUpdate={(newConfig) => {
                    console.log('Parent received new config:', newConfig);
                    setStatusConfig(newConfig);
                  }}
                  onSave={async (newConfig) => {
                    await handleStatusConfigUpdate(newConfig);
                  }}
                  isSaving={isSaving}
                />

                {/* 状态同步配置 */}
                <div className="md:col-span-2 lg:col-span-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">状态同步</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(statusConfig?.vital_signs || {}).map(([key, config]) => (
                      <StatusCard
                        key={key}
                        statusKey={key}
                        config={{
                          ...config,
                          __parent: statusConfig
                        }}
                        onUpdate={(updatedConfig) => {
                          setStatusConfig({
                            ...statusConfig,
                            vital_signs: {
                              ...statusConfig.vital_signs,
                              [key]: updatedConfig
                            }
                          });
                        }}
                        onDelete={() => handleRemoveStatusField('vital_signs', key)}
                        onSave={async (config) => {
                          await handleStatusConfigUpdate(config);
                        }}
                        isSaving={isSaving}
                      />
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => handleAddStatusField('vital_signs')}
                      className="w-full h-[120px] flex items-center justify-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      添加状态
                    </Button>
                    
                    {newStatusKey && (
                      <StatusCard
                        statusKey={newStatusKey}
                        config={{
                          key: newStatusKey,
                          label: '',
                          valueType: 'text',
                          description: '',
                          suffix: '',
                          __parent: statusConfig
                        }}
                        onUpdate={() => {}}
                        onDelete={() => setNewStatusKey(null)}
                        onSave={async (config) => {
                          await handleSaveNewStatus(config);
                          await handleStatusConfigUpdate({
                            ...statusConfig,
                            vital_signs: {
                              ...(statusConfig.vital_signs || {}),
                              [newStatusKey]: config
                            }
                          });
                        }}
                        isSaving={isSaving}
                        isNew={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-red-500 mb-2">危险操作</h3>
              <div className="space-y-2">
                {showDeleteConfirm ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">确定要删除这个角色吗？此操作不可恢复。</p>
                    <div className="space-x-2">
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? '删除中...' : '确认删除'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    删除角色
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const ThemeCard: React.FC<{
  theme?: {
    background_url?: string;
    background_overlay?: string;
    accent_color?: string;
  };
  config: StatusConfigType;
  onUpdate: (theme: any) => void;
  onSave: (config: any) => Promise<void>;
  isSaving: boolean;
}> = ({ theme, config, onUpdate, onSave, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTheme, setLocalTheme] = useState(theme || {
    background_url: '',
    background_overlay: 'from-gray-900/95 to-gray-800/95',
    accent_color: 'from-blue-400 to-purple-400'
  });

  useEffect(() => {
    setLocalTheme(theme || {
      background_url: '',
      background_overlay: 'from-gray-900/95 to-gray-800/95',
      accent_color: 'from-blue-400 to-purple-400'
    });
  }, [theme]);

  const handleSave = async () => {
    console.log('ThemeCard - Saving theme:', localTheme);
    const newConfig = {
      ...config,
      theme: localTheme
    };
    onUpdate(localTheme);
    await onSave(newConfig);
    setIsEditing(false);
  };

  return (
    <>
      <Card
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <h5 className="text-sm font-medium">背景主题设置</h5>
          <p className="text-sm text-gray-500 truncate w-full">
            背景图片: {localTheme.background_url || '未设置'}
          </p>
          <Settings2 className="h-4 w-4 text-gray-400 mt-2" />
        </div>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑背景主题</DialogTitle>
            <DialogDescription>
              设置展示页面的背景图片和主题
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="background_url">背景图片URL</Label>
              <Input
                id="background_url"
                value={localTheme.background_url || ''}
                onChange={(e) => setLocalTheme({
                  ...localTheme,
                  background_url: e.target.value
                })}
                placeholder="https://example.com/background.jpg"
              />
              <p className="text-sm text-gray-500">输入图片的URL地址</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setLocalTheme(theme || {
                    background_url: '',
                    background_overlay: 'from-gray-900/95 to-gray-800/95',
                    accent_color: 'from-blue-400 to-purple-400'
                  });
                  setIsEditing(false);
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const DisplayConfigCard: React.FC<{
  config: any;
  onUpdate: (config: any) => void;
  onSave: (config: any) => Promise<void>;
  isSaving: boolean;
}> = ({ config, onUpdate, onSave, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState(config?.display || {
    default_message: '状态良好',
    timeout_messages: []
  });

  useEffect(() => {
    setLocalConfig(config?.display || {
      default_message: '状态良好',
      timeout_messages: []
    });
  }, [config]);

  const handleSave = async () => {
    console.log('DisplayConfigCard - Current config:', config);
    console.log('DisplayConfigCard - Local config to save:', localConfig);
    const newConfig = {
      ...config,
      display: localConfig
    };
    onUpdate(newConfig);
    console.log('DisplayConfigCard - Updated parent config:', newConfig);
    await onSave(newConfig);
    setIsEditing(false);
  };

  return (
    <>
      <Card
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <h5 className="text-sm font-medium">状态显示设置</h5>
          <p className="text-sm text-gray-500 truncate w-full">
            默认状态: {localConfig.default_message || '状态良好'}
          </p>
          <p className="text-sm text-gray-500 truncate w-full">
            超时配置: {localConfig.timeout_messages?.length || 0} 条规则
          </p>
          <Settings2 className="h-4 w-4 text-gray-400 mt-2" />
        </div>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑状态显示设置</DialogTitle>
            <DialogDescription>
              配置默认状态文本和超时显示规则
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>默认状态文本</Label>
              <Input
                value={localConfig.default_message || ''}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  default_message: e.target.value
                })}
                placeholder="例如：状态良好"
              />
            </div>
            
            <div className="space-y-2">
              <Label>超时状态配置（设置多少小时后显示对应文本）</Label>
              {localConfig.timeout_messages?.map((msg: { hours: number; message: string }, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="number"
                    className="w-16"
                    value={msg.hours}
                    onChange={(e) => {
                      const newMessages = [...localConfig.timeout_messages];
                      newMessages[index] = {
                        ...msg,
                        hours: parseInt(e.target.value) || 0
                      };
                      setLocalConfig({
                        ...localConfig,
                        timeout_messages: newMessages
                      });
                    }}
                    placeholder="小时"
                  />
                  <Input
                    className="flex-1"
                    value={msg.message}
                    onChange={(e) => {
                      const newMessages = [...localConfig.timeout_messages];
                      newMessages[index] = {
                        ...msg,
                        message: e.target.value
                      };
                      setLocalConfig({
                        ...localConfig,
                        timeout_messages: newMessages
                      });
                    }}
                    placeholder="显示文本"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newMessages = [...localConfig.timeout_messages];
                      newMessages.splice(index, 1);
                      setLocalConfig({
                        ...localConfig,
                        timeout_messages: newMessages
                      });
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setLocalConfig({
                    ...localConfig,
                    timeout_messages: [
                      ...(localConfig.timeout_messages || []),
                      { hours: 1, message: '' }
                    ]
                  });
                }}
                className="w-full mt-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                添加超时状态
              </Button>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setLocalConfig(config?.display || {
                    default_message: '状态良好',
                    timeout_messages: []
                  });
                  setIsEditing(false);
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const StatusCard: React.FC<{
  statusKey: string;
  config: any;
  onUpdate: (config: any) => void;
  onDelete: () => void;
  onSave: (config: any) => Promise<void>;
  isSaving: boolean;
  isNew?: boolean;
}> = ({ statusKey, config, onUpdate, onDelete, onSave, isSaving, isNew }) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = async () => {
    console.log('StatusCard - Saving config for key:', statusKey, localConfig);
    // 获取父组件的完整配置
    const parentConfig = config.__parent || {};
    // 更新特定状态的配置
    const newConfig = {
      ...parentConfig,
      vital_signs: {
        ...(parentConfig.vital_signs || {}),
        [statusKey]: localConfig
      }
    };
    console.log('StatusCard - Full config to save:', newConfig);
    onUpdate(localConfig);
    await onSave(newConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (isNew) {
      onDelete();
    } else {
      setLocalConfig(config);
    }
  };

  const handleDelete = async () => {
    try {
      onDelete();
      setIsEditing(false);
    } catch (err) {
      toast.error("删除状态失败");
    }
  };

  return (
    <>
      {!isNew && (
        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsEditing(true)}
        >
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <h5 className="text-sm font-medium">{config.label || statusKey}</h5>
            <p className="text-sm text-gray-500 truncate w-full">
              类型: {config.valueType === 'number' ? '数值' : '文本'}
              {config.suffix ? `（${config.suffix}）` : ''}
            </p>
            {config.description && (
              <p className="text-sm text-gray-500 truncate w-full">
                描述: {config.description}
              </p>
            )}
            <Settings2 className="h-4 w-4 text-gray-400 mt-2" />
          </div>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={isNew ? undefined : setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? '新增状态' : '编辑状态配置'}</DialogTitle>
            <DialogDescription>
              {isNew ? '配置新的状态字段' : '修改状态的显示和行为配置'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>状态键名</Label>
                <Input
                  value={localConfig.key}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    key: e.target.value
                  })}
                  placeholder="用于API通信的键名"
                />
              </div>
              <div>
                <Label>显示名称</Label>
                <Input
                  value={localConfig.label}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    label: e.target.value
                  })}
                  placeholder="在界面上显示的名称"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>值类型</Label>
                <Select
                  value={localConfig.valueType}
                  onValueChange={(value) => {
                    const valueType = value as 'number' | 'text';
                    setLocalConfig({
                      ...localConfig,
                      valueType,
                      suffix: valueType === 'text' ? undefined : localConfig.suffix
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择值类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">数值</SelectItem>
                    <SelectItem value="text">文本</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>描述</Label>
                <Input
                  value={localConfig.description || ''}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    description: e.target.value
                  })}
                  placeholder="状态的描述信息"
                />
              </div>
            </div>
            {localConfig.valueType === 'number' && (
              <div>
                <Label>单位</Label>
                <Input
                  value={localConfig.suffix || ''}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    suffix: e.target.value
                  })}
                  placeholder="例如：%、℃"
                />
              </div>
            )}
            <div className="flex justify-between pt-4">
              {!isNew && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  删除
                </Button>
              )}
              <div className={`space-x-2 ${isNew ? 'w-full flex justify-end' : ''}`}>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 