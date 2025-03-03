import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Settings2, TrashIcon, PlusIcon, ChevronDown, ChevronUp, Music, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusConfigType } from '@/types/character';
import { parseNeteaseMusicLink } from '@/utils/musicLinkParser';

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
  raw_music_link?: string; // 用户输入的原始链接
}

interface DefaultMessage {
  message: string;
  music_url?: string;
  raw_music_url?: string; // 用户输入的原始链接
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
    music_url: '',
    raw_music_url: ''
  });
  const [musicLinkError, setMusicLinkError] = useState<string | null>(null);
  const [parsedMusicLink, setParsedMusicLink] = useState<string | null>(null);
  const [isParsingLink, setIsParsingLink] = useState(false);
  
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
    const message = {...localConfig.timeout_messages[index]};
    setEditingMessageIndex(index);
    setEditingMessage({
      ...message,
      raw_music_link: message.music_link || ''
    });
    setMusicLinkError(null);
    setParsedMusicLink(message.music_link || null);
  };

  const validateAndParseMusicLink = (link: string): string | null => {
    if (!link) return null;
    
    const parsedLink = parseNeteaseMusicLink(link);
    if (!parsedLink && link.trim() !== '') {
      setMusicLinkError('无效的网易云音乐链接，请检查后重试');
      setParsedMusicLink(null);
      return null;
    }
    
    setMusicLinkError(null);
    setParsedMusicLink(parsedLink);
    return parsedLink;
  };

  const handleSaveTimeoutMessage = async () => {
    if (editingMessageIndex !== null && editingMessage) {
      // 解析音乐链接
      const parsedMusicLink = validateAndParseMusicLink(editingMessage.raw_music_link || '');
      
      // 如果链接无效且用户输入了内容，不保存
      if (musicLinkError) return;
      
      const newMessages = [...localConfig.timeout_messages];
      newMessages[editingMessageIndex] = {
        hours: editingMessage.hours,
        message: editingMessage.message,
        music_link: parsedMusicLink || undefined
      };
      
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
      setParsedMusicLink(null);
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
      setParsedMusicLink(null);
    }
  };

  const handleAddTimeoutMessage = () => {
    const newMessage = { hours: 24, message: '', music_link: '', raw_music_link: '' };
    const newIndex = localConfig.timeout_messages.length;
    setLocalConfig({
      ...localConfig,
      timeout_messages: [...localConfig.timeout_messages, { hours: 24, message: '', music_link: undefined }]
    });
    // 立即打开编辑对话框
    setEditingMessageIndex(newIndex);
    setEditingMessage(newMessage);
    setMusicLinkError(null);
    setParsedMusicLink(null);
  };

  const handleEditDefaultMessage = () => {
    setDefaultMessageData({
      message: localConfig.default_message,
      music_url: localConfig.default_music_url || '',
      raw_music_url: localConfig.default_music_url || ''
    });
    setIsEditingDefault(true);
    setMusicLinkError(null);
    setParsedMusicLink(localConfig.default_music_url || null);
  };

  const handleSaveDefaultMessage = async () => {
    // 解析音乐链接
    const parsedMusicLink = validateAndParseMusicLink(defaultMessageData.raw_music_url || '');
    
    // 如果链接无效且用户输入了内容，不保存
    if (musicLinkError) return;
    
    const updatedConfig = {
      ...localConfig,
      default_message: defaultMessageData.message,
      default_music_url: parsedMusicLink || undefined
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
    setParsedMusicLink(null);
  };

  const handleMusicLinkChange = async (value: string, isDefault: boolean = false) => {
    if (isDefault) {
      setDefaultMessageData({
        ...defaultMessageData,
        raw_music_url: value
      });
    } else if (editingMessage) {
      setEditingMessage({
        ...editingMessage,
        raw_music_link: value
      });
    }
    
    // 清除错误提示
    setMusicLinkError(null);
    
    // 如果输入为空，清除解析结果
    if (!value.trim()) {
      setParsedMusicLink(null);
      return;
    }
    
    // 实时解析链接
    setIsParsingLink(true);
    
    // 使用setTimeout模拟异步解析，避免UI阻塞
    setTimeout(() => {
      const parsedLink = parseNeteaseMusicLink(value);
      if (!parsedLink) {
        setMusicLinkError('无效的网易云音乐链接，请检查后重试');
        setParsedMusicLink(null);
      } else {
        setMusicLinkError(null);
        setParsedMusicLink(parsedLink);
      }
      setIsParsingLink(false);
    }, 300);
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
                        音乐
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
                              音乐
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
            setMusicLinkError(null);
            setParsedMusicLink(null);
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
              <Label>网易云音乐链接（可选）</Label>
              <div className="relative">
                <Input
                  value={defaultMessageData.raw_music_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleMusicLinkChange(e.target.value, true)
                  }
                  placeholder="粘贴网易云音乐分享链接"
                  className={musicLinkError ? "border-red-300 pr-8" : "pr-8"}
                />
                {isParsingLink && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {musicLinkError && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {musicLinkError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                支持网易云音乐分享链接，将在正常状态下播放
              </p>
            </div>
            
            {/* 音乐预览 */}
            {parsedMusicLink && (
              <div className="mt-4 border rounded-md p-3 bg-gray-50">
                <Label className="text-xs text-gray-500 mb-2 block">音乐预览</Label>
                <div className="w-full flex justify-center">
                  <iframe 
                    frameBorder="no" 
                    style={{ border: 0 }}
                    width={330} 
                    height={100} 
                    src={parsedMusicLink}
                    className="mx-auto"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingDefault(false);
                setMusicLinkError(null);
                setParsedMusicLink(null);
              }}
            >
              取消
            </Button>
            <Button 
              onClick={handleSaveDefaultMessage}
              disabled={isSaving || !!musicLinkError || isParsingLink}
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
            setMusicLinkError(null);
            setParsedMusicLink(null);
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
                <div className="relative">
                  <Input
                    value={editingMessage.raw_music_link || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleMusicLinkChange(e.target.value)
                    }
                    placeholder="粘贴网易云音乐分享链接"
                    className={musicLinkError ? "border-red-300 pr-8" : "pr-8"}
                  />
                  {isParsingLink && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {musicLinkError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {musicLinkError}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  支持网易云音乐分享链接，将在超时状态下播放
                </p>
              </div>
              
              {/* 音乐预览 */}
              {parsedMusicLink && (
                <div className="mt-4 border rounded-md p-3 bg-gray-50">
                  <Label className="text-xs text-gray-500 mb-2 block">音乐预览</Label>
                  <div className="w-full flex justify-center">
                    <iframe 
                      frameBorder="no" 
                      style={{ border: 0 }}
                      width={330} 
                      height={100} 
                      src={parsedMusicLink}
                      className="mx-auto"
                    ></iframe>
                  </div>
                </div>
              )}
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
                  setMusicLinkError(null);
                  setParsedMusicLink(null);
                }}
              >
                取消
              </Button>
              <Button 
                onClick={handleSaveTimeoutMessage}
                disabled={isSaving || !!musicLinkError || isParsingLink}
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