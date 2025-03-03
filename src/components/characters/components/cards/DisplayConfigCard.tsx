import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Settings2, TrashIcon, PlusIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusConfigType } from '@/types/character';

interface DisplayConfig {
  default_message: string;
  timeout_messages: Array<{
    hours: number;
    message: string;
    music_link?: string;
  }>;
}

interface DisplayConfigCardProps {
  config: StatusConfigType;
  onUpdate: (config: StatusConfigType) => void;
  onSave: (config: StatusConfigType) => Promise<void>;
  isSaving: boolean;
}

export const DisplayConfigCard: React.FC<DisplayConfigCardProps> = ({
  config,
  onUpdate,
  onSave,
  isSaving
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const defaultConfig: DisplayConfig = {
    default_message: '状态良好',
    timeout_messages: []
  };

  const [localConfig, setLocalConfig] = useState<DisplayConfig>({
    default_message: config?.display?.default_message || defaultConfig.default_message,
    timeout_messages: config?.display?.timeout_messages || defaultConfig.timeout_messages
  });

  useEffect(() => {
    setLocalConfig({
      default_message: config?.display?.default_message || defaultConfig.default_message,
      timeout_messages: config?.display?.timeout_messages || defaultConfig.timeout_messages
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
            默认状态: {localConfig.default_message}
          </p>
          <p className="text-sm text-gray-500 truncate w-full">
            超时配置: {localConfig.timeout_messages.length} 条规则
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
                value={localConfig.default_message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({
                  ...localConfig,
                  default_message: e.target.value
                })}
                placeholder="例如：状态良好"
              />
            </div>
            
            <div className="space-y-2">
              <Label>超时状态配置（设置多少小时后显示对应文本）</Label>
              {localConfig.timeout_messages.map((msg, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="number"
                    className="w-16"
                    value={msg.hours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                  <Input
                    value={msg.music_link || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newMessages = [...localConfig.timeout_messages];
                      newMessages[index] = {
                        ...msg,
                        music_link: e.target.value
                      };
                      setLocalConfig({
                        ...localConfig,
                        timeout_messages: newMessages
                      });
                    }}
                    placeholder="网易云音乐分享链接（可选）"
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
                      ...localConfig.timeout_messages,
                      { hours: 1, message: '', music_link: '' }
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
                  setLocalConfig({
                    default_message: config?.display?.default_message || defaultConfig.default_message,
                    timeout_messages: config?.display?.timeout_messages || defaultConfig.timeout_messages
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