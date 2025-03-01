import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Input from '../ui/Input';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { CheckIcon, XIcon, PlusIcon } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacters';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { UpdateCharacterData, StatusConfigType } from '@/types/character';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StatusCard } from './components/cards/StatusCard';
import { ThemeCard } from './components/cards/ThemeCard';
import { DisplayConfigCard } from './components/cards/DisplayConfigCard';

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

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">基础设置</TabsTrigger>
                <TabsTrigger value="display">展示配置</TabsTrigger>
                <TabsTrigger value="sync">状态同步</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                <div className="pt-4">
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
              </TabsContent>

              <TabsContent value="display" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
              </TabsContent>

              <TabsContent value="sync" className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-4">状态同步</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(statusConfig?.vital_signs || {}).map(([key, config]) => (
                      <StatusCard
                        key={key}
                        statusKey={key}
                        config={{
                          key,
                          label: config.label || key,
                          valueType: config.valueType || 'text',
                          description: config.description,
                          suffix: config.suffix,
                          color: config.color,
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
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>
    </div>
  );
}; 