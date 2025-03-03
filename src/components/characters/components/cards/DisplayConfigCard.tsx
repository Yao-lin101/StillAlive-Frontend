import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Settings2, TrashIcon, PlusIcon, ChevronDown, ChevronUp, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusConfigType } from '@/types/character';

interface DisplayConfig {
  default_message: string;
  default_music_url?: string;
  timeout_messages: Array<{
    hours: number;
    message: string;
    music_link?: string;
  }>;
}

interface TimeoutMessage {
  hours: number;
  message: string;
  music_link?: string;
}

interface DefaultMessage {
  message: string;
  music_url?: string;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState<TimeoutMessage | null>(null);
  const [isEditingDefault, setIsEditingDefault] = useState(false);
  const [defaultMessageData, setDefaultMessageData] = useState<DefaultMessage>({
    message: '',
    music_url: ''
  });
  
  const defaultConfig: DisplayConfig = {
    default_message: '状态良好',
    default_music_url: '',
    timeout_messages: []
  };

  const [localConfig, setLocalConfig] = useState<DisplayConfig>({
    default_message: config?.display?.default_message || defaultConfig.default_message,
    default_music_url: config?.display?.default_music_url || defaultConfig.default_music_url,
    timeout_messages: config?.display?.timeout_messages || defaultConfig.timeout_messages
  });

  useEffect(() => {
    setLocalConfig({
      default_message: config?.display?.default_message || defaultConfig.default_message,
      default_music_url: config?.display?.default_music_url || defaultConfig.default_music_url,
      timeout_messages: config?.display?.timeout_messages || defaultConfig.timeout_messages
    });
  }, [config]);

  const handleEditTimeoutMessage = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingMessageIndex(index);
    setEditingMessage({...localConfig.timeout_messages[index]});
  };

  const handleSaveTimeoutMessage = async () => {
    if (editingMessageIndex !== null && editingMessage) {
      const newMessages = [...localConfig.timeout_messages];
      newMessages[editingMessageIndex] = editingMessage;
      
      const updatedConfig = {
        ...localConfig,
        timeout_messages: newMessages
      };
      
      setLocalConfig(updatedConfig);
      
      // 保存到服务器
      const newConfig = {
        ...config,
        display: updatedConfig
      };
      onUpdate(newConfig);
      await onSave(newConfig);
      
      setEditingMessageIndex(null);
      setEditingMessage(null);
    }
  };

  const handleDeleteTimeoutMessage = async () => {
    if (editingMessageIndex !== null) {
      const newMessages = [...localConfig.timeout_messages];
      newMessages.splice(editingMessageIndex, 1);
      
      const updatedConfig = {
        ...localConfig,
        timeout_messages: newMessages
      };
      
      setLocalConfig(updatedConfig);
      
      // 保存到服务器
      const newConfig = {
        ...config,
        display: updatedConfig
      };
      onUpdate(newConfig);
      await onSave(newConfig);
      
      setEditingMessageIndex(null);
      setEditingMessage(null);
    }
  };

  const handleAddTimeoutMessage = () => {
    const newMessage = { hours: 24, message: '', music_link: '' };
    const newIndex = localConfig.timeout_messages.length;
    setLocalConfig({
      ...localConfig,
      timeout_messages: [...localConfig.timeout_messages, newMessage]
    });
    // 立即打开编辑对话框
    setEditingMessageIndex(newIndex);
    setEditingMessage(newMessage);
  };

  const handleEditDefaultMessage = () => {
    setDefaultMessageData({
      message: localConfig.default_message,
      music_url: localConfig.default_music_url || ''
    });
    setIsEditingDefault(true);
  };

  const handleSaveDefaultMessage = async () => {
    const updatedConfig = {
      ...localConfig,
      default_message: defaultMessageData.message,
      default_music_url: defaultMessageData.music_url
    };
    
    setLocalConfig(updatedConfig);
    
    // 保存到服务器
    const newConfig = {
      ...config,
      display: updatedConfig
    };
    onUpdate(newConfig);
    await onSave(newConfig);
    
    setIsEditingDefault(false);
  };

  return (
    <>
      <Card className="p-4 transition-all duration-200">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Settings2 className="h-4 w-4 text-gray-400" />
            <h5 className="text-sm font-medium">状态显示设置</h5>
          </div>
          <div className="flex items-center">
            {!isExpanded && (
              <div className="text-xs text-gray-500 mr-2">
                {localConfig.timeout_messages.length} 条规则
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* 默认状态文本区域 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="font-medium">默认状态文本</Label>
              </div>
              <div 
                className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={handleEditDefaultMessage}
              >
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">默认状态</p>
                    {localConfig.default_music_url && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Music className="h-3 w-3 mr-1" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 w-full text-left">
                    {localConfig.default_message}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 超时状态列表 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="font-medium">超时状态配置</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddTimeoutMessage}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  添加
                </Button>
              </div>
              
              {localConfig.timeout_messages.length === 0 ? (
                <p className="text-sm text-gray-500 italic p-4 text-center border rounded-md">
                  暂无超时状态配置
                </p>
              ) : (
                <div 
                  className="space-y-2 mt-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db transparent'
                  }}
                >
                  {localConfig.timeout_messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleEditTimeoutMessage(index)}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">{msg.hours} 小时后</p>
                          {msg.music_link && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Music className="h-3 w-3 mr-1" />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 w-full text-left">
                          {msg.message || '(无消息)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 默认状态编辑对话框 */}
      <Dialog 
        open={isEditingDefault} 
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingDefault(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑默认状态</DialogTitle>
            <DialogDescription>
              设置角色在正常状态下的显示内容
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>默认状态文本</Label>
              <Input
                value={defaultMessageData.message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDefaultMessageData({
                  ...defaultMessageData,
                  message: e.target.value
                })}
                placeholder="例如：状态良好"
              />
            </div>
            
            <div>
              <Label>默认音乐链接（可选）</Label>
              <Input
                value={defaultMessageData.music_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDefaultMessageData({
                  ...defaultMessageData,
                  music_url: e.target.value
                })}
                placeholder="粘贴网易云音乐分享链接"
              />
              <p className="text-xs text-gray-500 mt-1">
                支持网易云音乐分享链接，将在正常状态下播放
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingDefault(false)}
            >
              取消
            </Button>
            <Button 
              onClick={handleSaveDefaultMessage}
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 超时状态编辑对话框 */}
      <Dialog 
        open={editingMessageIndex !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingMessageIndex(null);
            setEditingMessage(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑超时状态</DialogTitle>
            <DialogDescription>
              设置超时时间和显示内容
            </DialogDescription>
          </DialogHeader>
          
          {editingMessage && (
            <div className="space-y-4">
              <div>
                <Label>超时时间（小时）</Label>
                <Input
                  type="number"
                  value={editingMessage.hours}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMessage({
                    ...editingMessage,
                    hours: parseInt(e.target.value) || 0
                  })}
                  placeholder="例如：24"
                />
              </div>
              
              <div>
                <Label>显示消息</Label>
                <Input
                  value={editingMessage.message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMessage({
                    ...editingMessage,
                    message: e.target.value
                  })}
                  placeholder="超时后显示的消息"
                />
              </div>
              
              <div>
                <Label>网易云音乐链接（可选）</Label>
                <Input
                  value={editingMessage.music_link || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMessage({
                    ...editingMessage,
                    music_link: e.target.value
                  })}
                  placeholder="粘贴网易云音乐分享链接"
                />
                <p className="text-xs text-gray-500 mt-1">
                  支持网易云音乐分享链接，将在超时状态下播放
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteTimeoutMessage}
              className="text-red-500 border-red-200 hover:bg-red-50"
              disabled={isSaving}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              {isSaving ? '删除中...' : '删除'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingMessageIndex(null);
                  setEditingMessage(null);
                }}
              >
                取消
              </Button>
              <Button 
                onClick={handleSaveTimeoutMessage}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 