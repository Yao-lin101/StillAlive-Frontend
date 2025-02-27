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
import { UpdateCharacterData, CharacterDetail as ICharacterDetail, StatusConfigType, StatusRule, StatusConfig, VitalSigns } from '@/types/character';
import { Select } from '../ui/select';
import { HexColorPicker } from 'react-colorful';
import { Popover } from '../ui/popover';

const updateCharacterSchema = z.object({
  name: z.string().min(1, '请输入角色名称'),
  bio: z.string().max(500, '简介最多500字').optional(),
  avatar: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024,
      '图片大小不能超过5MB'
    ),
});

type UpdateCharacterFormData = z.infer<typeof updateCharacterSchema>;

type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;

// Add this new component for color picking
const ColorPickerInput: React.FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      content={
        <div className="p-2">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      }
    >
      <div className="flex items-center space-x-2">
        <div
          className="w-8 h-8 rounded border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(true)}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="颜色代码"
          className="flex-1"
        />
      </div>
    </Popover>
  );
};

export const CharacterDetail: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { character, isLoading, error, silentRefetch } = useCharacter(uid!);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusConfig, setStatusConfig] = useState<StatusConfigType>({ vital_signs: {} });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateCharacterFormData>({
    resolver: zodResolver(updateCharacterSchema),
  });

  useEffect(() => {
    if (character) {
      reset({
        name: character.name,
        bio: character.bio || '',
      });
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

  const handleAddStatusField = (category: keyof StatusConfigType) => {
    const currentFields = statusConfig[category] || {};
    const newKey = `status_${Object.keys(currentFields).length + 1}`;
    
    setStatusConfig({
      ...statusConfig,
      [category]: {
        ...currentFields,
        [newKey]: {
          key: newKey,
          label: '',
          suffix: '',
          description: '',
          valueType: 'number',
          defaultValue: 0,
          min: 0,
          max: 100,
          color: {
            type: 'threshold',
            rules: [
              { value: 0, color: '#ff0000' },
              { default: true, color: '#00ff00' }
            ]
          }
        }
      }
    });
  };

  const handleRemoveStatusField = (category: keyof StatusConfigType, key: string) => {
    const currentFields = { ...statusConfig[category] } || {};
    delete currentFields[key];
    
    setStatusConfig({
      ...statusConfig,
      [category]: currentFields
    });
  };

  const handleStatusConfigUpdate = async () => {
    try {
      setIsSaving(true);
      await characterService.update(uid!, { status_config: statusConfig });
      setIsEditingStatus(false);
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
      };

      if (data.avatar?.[0]) {
        updateData.avatar = data.avatar[0];
      }
      
      await characterService.update(uid!, updateData);
      setIsEditing(false);
      await silentRefetch();
    } catch (err) {
      setUpdateError(formatError(err));
    } finally {
      setIsSaving(false);
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
              <div className="flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium">更换头像</label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register('avatar')}
                    error={errors.avatar?.message}
                  />
                  <p className="text-xs text-gray-500">
                    支持jpg、png格式，大小不超过5MB
                  </p>
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
              <div className="flex items-center space-x-2">
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
              <h3 className="text-sm font-medium text-gray-500 mb-2">状态配置</h3>
              {isEditingStatus ? (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">生命体征</h4>
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
                                const valueType = e.target.value as StatusValueType;
                                setStatusConfig({
                                  ...statusConfig,
                                  vital_signs: {
                                    ...statusConfig.vital_signs,
                                    [key]: {
                                      ...config,
                                      valueType,
                                      // Reset color rules based on type
                                      color: {
                                        type: valueType === 'number' ? 'threshold' : 'enum',
                                        rules: valueType === 'number' 
                                          ? [{ value: 0, color: '#ff0000' }, { default: true, color: '#00ff00' }]
                                          : [{ value: '', label: '默认', color: '#000000', default: true }]
                                      }
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
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm">默认值</label>
                              <Input
                                type="number"
                                value={config.defaultValue}
                                onChange={(e) => {
                                  setStatusConfig({
                                    ...statusConfig,
                                    vital_signs: {
                                      ...statusConfig.vital_signs,
                                      [key]: {
                                        ...config,
                                        defaultValue: Number(e.target.value)
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-sm">最小值</label>
                              <Input
                                type="number"
                                value={config.min}
                                onChange={(e) => {
                                  setStatusConfig({
                                    ...statusConfig,
                                    vital_signs: {
                                      ...statusConfig.vital_signs,
                                      [key]: {
                                        ...config,
                                        min: Number(e.target.value)
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-sm">最大值</label>
                              <Input
                                type="number"
                                value={config.max}
                                onChange={(e) => {
                                  setStatusConfig({
                                    ...statusConfig,
                                    vital_signs: {
                                      ...statusConfig.vital_signs,
                                      [key]: {
                                        ...config,
                                        max: Number(e.target.value)
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {config.valueType !== 'number' && (
                          <div>
                            <label className="text-sm">默认值</label>
                            <Input
                              value={config.defaultValue || ''}
                              onChange={(e) => {
                                setStatusConfig({
                                  ...statusConfig,
                                  vital_signs: {
                                    ...statusConfig.vital_signs,
                                    [key]: {
                                      ...config,
                                      defaultValue: e.target.value
                                    }
                                  }
                                });
                              }}
                              placeholder={
                                '输入默认文本'
                              }
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-sm">规则类型</label>
                          <Select
                            value={config.color.type}
                            onChange={(e: SelectChangeEvent) => {
                              const type = e.target.value as 'threshold' | 'range' | 'enum';
                              setStatusConfig({
                                ...statusConfig,
                                vital_signs: {
                                  ...statusConfig.vital_signs,
                                  [key]: {
                                    ...config,
                                    color: {
                                      type,
                                      rules: config.color.rules
                                    }
                                  }
                                }
                              });
                            }}
                          >
                            {config.valueType === 'number' ? (
                              <>
                                <option value="threshold">阈值</option>
                                <option value="range">范围</option>
                              </>
                            ) : (
                              <option value="enum">枚举</option>
                            )}
                          </Select>
                        </div>
                        {config.color.type === 'enum' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm">枚举值规则</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newRules = [...config.color.rules];
                                  newRules.push({
                                    value: '',
                                    label: '',
                                    color: '#000000'
                                  });
                                  setStatusConfig({
                                    ...statusConfig,
                                    vital_signs: {
                                      ...statusConfig.vital_signs,
                                      [key]: {
                                        ...config,
                                        color: {
                                          ...config.color,
                                          rules: newRules
                                        }
                                      }
                                    }
                                  });
                                }}
                              >
                                <PlusIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            {config.color.rules.map((rule, index) => (
                              <div key={index} className="grid grid-cols-4 gap-2 items-center">
                                <Input
                                  value={rule.value || ''}
                                  onChange={(e) => {
                                    const newRules = [...config.color.rules];
                                    newRules[index] = {
                                      ...rule,
                                      value: e.target.value
                                    };
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          color: {
                                            ...config.color,
                                            rules: newRules
                                          }
                                        }
                                      }
                                    });
                                  }}
                                  placeholder="值"
                                />
                                <Input
                                  value={rule.label || ''}
                                  onChange={(e) => {
                                    const newRules = [...config.color.rules];
                                    newRules[index] = {
                                      ...rule,
                                      label: e.target.value
                                    };
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          color: {
                                            ...config.color,
                                            rules: newRules
                                          }
                                        }
                                      }
                                    });
                                  }}
                                  placeholder="显示文本"
                                />
                                <ColorPickerInput
                                  value={rule.color}
                                  onChange={(color) => {
                                    const newRules = [...config.color.rules];
                                    newRules[index] = {
                                      ...rule,
                                      color
                                    };
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          color: {
                                            ...config.color,
                                            rules: newRules
                                          }
                                        }
                                      }
                                    });
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newRules = [...config.color.rules];
                                    newRules.splice(index, 1);
                                    setStatusConfig({
                                      ...statusConfig,
                                      vital_signs: {
                                        ...statusConfig.vital_signs,
                                        [key]: {
                                          ...config,
                                          color: {
                                            ...config.color,
                                            rules: newRules
                                          }
                                        }
                                      }
                                    });
                                  }}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
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
              ) : (
                <div className="space-y-4">
                  {Object.keys(statusConfig?.vital_signs || {}).length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">生命体征</h4>
                        {Object.entries(statusConfig?.vital_signs || {}).map(([key, config]) => (
                          <Card key={key} className="p-4">
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">{config.label}</h5>
                              <p className="text-sm text-gray-500">
                                单位: {config.suffix || '无'}
                              </p>
                              <p className="text-sm text-gray-500">
                                规则类型: {config.color.type === 'threshold' ? '阈值' : '范围'}
                              </p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">暂无状态配置</p>
                  )}
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
        )}
      </Card>
    </div>
  );
}; 