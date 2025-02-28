import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Input from '../ui/Input';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { CheckIcon, XIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacters';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { UpdateCharacterData, StatusConfigType, CharacterDetail as ICharacterDetail } from '@/types/character';
import { Select } from '../ui/select';
import { Label } from '@/components/ui/label';

const updateCharacterSchema = z.object({
  name: z.string().min(1, '请输入角色名称'),
  bio: z.string().max(500, '简介最多500字').optional(),
  avatar: z.string().url('请输入有效的URL地址').optional().or(z.literal('')),
  qqNumber: z.string().regex(/^\d{5,11}$/, 'QQ号格式不正确').optional().or(z.literal('')),
});

type UpdateCharacterFormData = z.infer<typeof updateCharacterSchema>;

type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;

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
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusConfig, setStatusConfig] = useState<StatusConfigType>({ vital_signs: {} });
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [localCharacter, setLocalCharacter] = useState<ICharacterDetail | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
      setLocalCharacter(character);
      reset({
        name: character.name,
        bio: character.bio || '',
        avatar: character.avatar || '',
      });
      setPreviewAvatar(character.avatar);
    }
  }, [character, reset]);

  useEffect(() => {
    if (character?.status_config) {
      setStatusConfig(character.status_config);
    } else {
      setStatusConfig({ vital_signs: {} });
    }
  }, [character]);

  const handleShowSecretKey = async () => {
    try {
      const key = await characterService.getSecretKey(uid!);
      setSecretKey(key);
    } catch (err) {
      setUpdateError(formatError(err));
    }
  };

  const handleRegenerateSecretKey = async () => {
    try {
      setIsRegeneratingKey(true);
      const key = await characterService.regenerateSecretKey(uid!);
      setSecretKey(key);
    } catch (err) {
      setUpdateError(formatError(err));
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  const handleRemoveStatusField = (category: keyof StatusConfigType, key: string) => {
    if (category === 'vital_signs') {
      const currentFields = { ...(statusConfig.vital_signs || {}) };
      delete currentFields[key];
      
      setStatusConfig({
        ...statusConfig,
        vital_signs: currentFields
      });
    }
  };

  const handleAddStatusField = (category: keyof StatusConfigType) => {
    if (category === 'vital_signs') {
      const newKey = `status_${Object.keys(statusConfig.vital_signs || {}).length + 1}`;
      setStatusConfig({
        ...statusConfig,
        vital_signs: {
          ...(statusConfig.vital_signs || {}),
          [newKey]: {
            key: newKey,
            label: '',
            valueType: 'number',
            description: '',
            suffix: ''
          }
        }
      });
    }
  };

  const handleStatusConfigUpdate = async () => {
    if (!character) return;
    
    try {
      setIsSaving(true);
      await characterService.update(uid!, { 
        name: character.name,
        status_config: {
          ...statusConfig,
          theme: localCharacter?.status_config?.theme
        }
      });
      setIsEditingStatus(false);
      setIsEditingTheme(false);
      await silentRefetch();
    } catch (err) {
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

  const handleThemeChange = (value: string) => {
    setLocalCharacter((prev: ICharacterDetail | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        status_config: {
          ...prev.status_config,
          theme: {
            background_url: value,
            background_overlay: 'from-gray-900/95 to-gray-800/95',
            accent_color: 'from-blue-400 to-purple-400'
          }
        }
      };
    });
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
                      onClick={() => {
                        const url = `${import.meta.env.VITE_CHARACTER_DISPLAY_BASE_URL}/d/${character.display_code}`;
                        navigator.clipboard.writeText(url);
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
                      } catch (err) {
                        setUpdateError(formatError(err));
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
                    onClick={handleRegenerateSecretKey}
                    disabled={isRegeneratingKey}
                  >
                    {isRegeneratingKey ? '生成中...' : '重新生成密钥'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">状态展示配置</h3>
              <div className="space-y-4">
                {isEditingStatus ? (
                  <>
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm">默认状态文本</label>
                          <Input
                            value={statusConfig.display?.default_message || ''}
                            onChange={(e) => {
                              setStatusConfig({
                                ...statusConfig,
                                display: {
                                  ...statusConfig.display,
                                  default_message: e.target.value || '状态良好',
                                  timeout_messages: statusConfig.display?.timeout_messages || []
                                }
                              });
                            }}
                            placeholder="例如：状态良好"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm">超时状态配置</label>
                          {statusConfig.display?.timeout_messages?.map((msg: { hours: number; message: string }, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                type="number"
                                className="w-24"
                                value={msg.hours}
                                onChange={(e) => {
                                  const newMessages = [...(statusConfig.display?.timeout_messages || [])];
                                  newMessages[index] = {
                                    ...msg,
                                    hours: parseInt(e.target.value) || 0
                                  };
                                  setStatusConfig({
                                    ...statusConfig,
                                    display: {
                                      default_message: statusConfig.display?.default_message || '状态良好',
                                      timeout_messages: newMessages
                                    }
                                  });
                                }}
                                placeholder="小时"
                              />
                              <span className="text-sm">小时后显示</span>
                              <Input
                                className="flex-1"
                                value={msg.message}
                                onChange={(e) => {
                                  const newMessages = [...(statusConfig.display?.timeout_messages || [])];
                                  newMessages[index] = {
                                    ...msg,
                                    message: e.target.value
                                  };
                                  setStatusConfig({
                                    ...statusConfig,
                                    display: {
                                      default_message: statusConfig.display?.default_message || '状态良好',
                                      timeout_messages: newMessages
                                    }
                                  });
                                }}
                                placeholder="显示文本"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newMessages = [...(statusConfig.display?.timeout_messages || [])];
                                  newMessages.splice(index, 1);
                                  setStatusConfig({
                                    ...statusConfig,
                                    display: {
                                      default_message: statusConfig.display?.default_message || '状态良好',
                                      timeout_messages: newMessages
                                    }
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
                              setStatusConfig({
                                ...statusConfig,
                                display: {
                                  default_message: statusConfig.display?.default_message || '状态良好',
                                  timeout_messages: [
                                    ...(statusConfig.display?.timeout_messages || []),
                                    { hours: 1, message: '' }
                                  ]
                                }
                              });
                            }}
                            className="w-full mt-2"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            添加超时状态
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">状态配置</h3>
                      <div className="space-y-4">
                        {Object.entries(statusConfig?.vital_signs || {}).map(([key, config]) => (
                          <Card key={key} className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <h5 className="text-sm font-medium">{config.label || key}</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStatusField('vital_signs', key)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm">状态键名</label>
                                <Input
                                  value={config.key}
                                  onChange={(e) => {
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          key: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  placeholder="用于API通信的键名"
                                />
                              </div>
                              <div>
                                <label className="text-sm">显示名称</label>
                                <Input
                                  value={config.label}
                                  onChange={(e) => {
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          label: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  placeholder="在界面上显示的名称"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm">值类型</label>
                                <Select
                                  value={config.valueType}
                                  onChange={(e: SelectChangeEvent) => {
                                    const valueType = e.target.value as 'number' | 'text';
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          valueType,
                                          suffix: valueType === 'text' ? undefined : config.suffix
                                        }
                                      }
                                    });
                                  }}
                                >
                                  <option value="number">数值</option>
                                  <option value="text">文本</option>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm">描述</label>
                                <Input
                                  value={config.description || ''}
                                  onChange={(e) => {
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          description: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  placeholder="状态的描述信息"
                                />
                              </div>
                            </div>
                            {config.valueType === 'number' && (
                              <div>
                                <label className="text-sm">单位</label>
                                <Input
                                  value={config.suffix || ''}
                                  onChange={(e) => {
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          suffix: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  placeholder="例如：%、℃"
                                />
                              </div>
                            )}
                          </Card>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => handleAddStatusField('vital_signs')}
                          className="w-full"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          添加状态
                        </Button>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingStatus(false);
                            setStatusConfig(character?.status_config || { vital_signs: {} });
                          }}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleStatusConfigUpdate}
                          disabled={isSaving}
                        >
                          {isSaving ? '保存中...' : '保存'}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(statusConfig?.vital_signs || {}).map(([key, config]) => (
                      <Card key={key} className="p-4">
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">{config.label}</h5>
                          <p className="text-sm text-gray-500">
                            类型: {config.valueType === 'number' ? '数值' : '文本'}
                            {config.suffix ? `（${config.suffix}）` : ''}
                          </p>
                          {config.description && (
                            <p className="text-sm text-gray-500">
                              描述: {config.description}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingStatus(true);
                      }}
                    >
                      编辑状态配置
                    </Button>
                  </div>
                )}
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

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">背景图片</h3>
          <Button
            variant="outline"
            onClick={() => setIsEditingTheme(!isEditingTheme)}
          >
            {isEditingTheme ? '取消' : '编辑'}
          </Button>
        </div>

        {isEditingTheme ? (
          <Card className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background_url">背景图片URL</Label>
                <Input
                  id="background_url"
                  placeholder="https://example.com/background.jpg"
                  value={localCharacter?.status_config?.theme?.background_url || ''}
                  onChange={(e) => handleThemeChange(e.target.value)}
                />
                <p className="text-sm text-gray-500">输入图片的URL地址</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingTheme(false);
                    setLocalCharacter(character);
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={() => {
                    handleStatusConfigUpdate();
                    setIsEditingTheme(false);
                  }}
                >
                  保存
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">背景图片</span>
                <span className="text-gray-400 truncate max-w-[300px]">
                  {localCharacter?.status_config?.theme?.background_url || '未设置'}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 