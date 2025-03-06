import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { PlusIcon } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacters';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { UpdateCharacterData, StatusConfigType, WillConfig } from '@/types/character';
import { toast } from 'sonner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StatusCard } from './components/cards/StatusCard';
import { ThemeCard } from './components/cards/ThemeCard';
import { DisplayConfigCard } from './components/cards/DisplayConfigCard';
import {
  CharacterStatusSection,
  DisplayLinkSection,
  SecretKeySection,
  DangerZoneSection,
  WillConfigSection
} from './components/sections';
import { CharacterForm } from './components/CharacterForm';

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
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [newStatusKey, setNewStatusKey] = useState<string | null>(null);
  const [willConfig, setWillConfig] = useState<WillConfig | null>(null);
  const [isLoadingWill, setIsLoadingWill] = useState(false);

  useEffect(() => {
    const fetchSecretKey = async () => {
      try {
        const key = await characterService.getSecretKey(uid!);
        setSecretKey(key);
      } catch (err) {
        console.error('Failed to fetch secret key:', err);
      }
    };
    
    if (uid) {
      fetchSecretKey();
    }
  }, [uid]);

  useEffect(() => {
    const fetchWillConfig = async () => {
      if (!uid) return;
      
      try {
        setIsLoadingWill(true);
        const config = await characterService.getWillConfig(uid);
        setWillConfig(config);
      } catch (err) {
        console.error('获取亡语配置失败:', err);
        // 如果是404错误，说明还没有配置，设置为null
        setWillConfig(null);
      } finally {
        setIsLoadingWill(false);
      }
    };
    
    fetchWillConfig();
  }, [uid]);

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

  const handleRegenerateSecretKey = async () => {
    try {
      setIsRegeneratingKey(true);
      const key = await characterService.regenerateSecretKey(uid!);
      setSecretKey(key);
      
      // 尝试复制到剪贴板，但不影响主流程
      try {
        await navigator.clipboard.writeText(key);
        toast.success("新密钥已生成并复制到剪贴板");
      } catch (err) {
        // 如果复制失败，只提示生成成功
        toast.success("新密钥已生成，移动端请重新复制");
      }
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
      setIsSaving(true);
      await characterService.update(uid!, { 
        name: character.name,
        status_config: newConfig
      });
      await silentRefetch();
    } catch (err) {
      console.error('Error saving status config:', err);
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

  // 处理亡语配置更新
  const handleWillConfigUpdate = async (field: keyof WillConfig, value: any) => {
    if (!uid) return;
    
    try {
      setIsSaving(true);
      const updatedConfig = await characterService.updateWillConfig(uid, { [field]: value });
      // 后端API已修改，直接返回单个对象而不是分页结果
      setWillConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      console.error('Error updating will config:', err);
      setUpdateError(formatError(err));
      throw err;
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
          <CharacterForm
            character={character}
            onSubmit={async (data) => {
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
            }}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
            updateError={updateError}
          />
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">基础</TabsTrigger>
                <TabsTrigger value="display">展示</TabsTrigger>
                <TabsTrigger value="sync">同步</TabsTrigger>
                <TabsTrigger value="will">亡语</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                <CharacterStatusSection
                  isActive={character.is_active}
                  onStatusChange={async (status) => {
                    try {
                      await characterService.updateStatus(uid!, status);
                      await silentRefetch();
                    } catch (err) {
                      setUpdateError(formatError(err));
                    }
                  }}
                />

                <DisplayLinkSection
                  displayCode={character.display_code}
                  baseUrl={import.meta.env.VITE_CHARACTER_DISPLAY_BASE_URL}
                  onRegenerateLink={async () => {
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
                  isSaving={isSaving}
                />

                <SecretKeySection
                  secretKey={secretKey}
                  isRegeneratingKey={isRegeneratingKey}
                  showRegenerateConfirm={showRegenerateConfirm}
                  onRegenerateKey={handleRegenerateSecretKey}
                  onCancelRegenerate={() => setShowRegenerateConfirm(false)}
                  onShowRegenerateConfirm={() => setShowRegenerateConfirm(true)}
                />

                <DangerZoneSection
                  showDeleteConfirm={showDeleteConfirm}
                  isDeleting={isDeleting}
                  onDelete={handleDelete}
                  onCancelDelete={() => setShowDeleteConfirm(false)}
                  onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
                />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(statusConfig?.vital_signs || {}).map(([key, config]) => (
                      <StatusCard
                        key={key}
                        statusKey={key}
                        config={{
                          ...config,
                          key: config.key || key,
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
                      disabled={Object.keys(statusConfig?.vital_signs || {}).length >= 10}
                      title={Object.keys(statusConfig?.vital_signs || {}).length >= 10 ? "最多添加10个状态" : ""}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      添加状态
                      {Object.keys(statusConfig?.vital_signs || {}).length >= 10 && (
                        <span className="ml-1 text-xs">(已达上限)</span>
                      )}
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

              <TabsContent value="will" className="space-y-6">
                {isLoadingWill ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <WillConfigSection
                    characterUid={uid!}
                    willConfig={willConfig}
                    onUpdate={handleWillConfigUpdate}
                    isLoading={isSaving}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>
    </div>
  );
}; 