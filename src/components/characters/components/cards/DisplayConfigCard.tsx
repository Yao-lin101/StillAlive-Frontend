import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Settings2, PlusIcon, ChevronDown, ChevronUp, Music } from 'lucide-react';
import { parseNeteaseMusicLink } from '@/utils/musicLinkParser';
import {
  DisplayConfig,
  TimeoutMessage,
  DefaultMessage,
  DisplayConfigCardProps
} from '@/types/displayConfig';
import { DefaultMessageDialog } from '../dialogs/DefaultMessageDialog';
import { TimeoutMessageDialog } from '../dialogs/TimeoutMessageDialog';

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
    raw_music_url: '',
    cover_url: ''
  });
  const [musicLinkError, setMusicLinkError] = useState<string | null>(null);
  const [parsedMusicLink, setParsedMusicLink] = useState<string | null>(null);
  const [isParsingLink, setIsParsingLink] = useState(false);
  
  const defaultConfig: DisplayConfig = {
    default_message: '状态良好',
    default_music_url: '',
    default_cover_url: '',
    timeout_messages: []
  };

  const [localConfig, setLocalConfig] = useState<DisplayConfig>({
    default_message: config?.display?.default_message || defaultConfig.default_message,
    default_music_url: config?.display?.default_music_url || defaultConfig.default_music_url,
    default_cover_url: config?.display?.default_cover_url || defaultConfig.default_cover_url,
    timeout_messages: config?.display?.timeout_messages || defaultConfig.timeout_messages
  });

  useEffect(() => {
    setLocalConfig({
      default_message: config?.display?.default_message || defaultConfig.default_message,
      default_music_url: config?.display?.default_music_url || defaultConfig.default_music_url,
      default_cover_url: config?.display?.default_cover_url || defaultConfig.default_cover_url,
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
      raw_music_link: message.music_link || '',
      cover_url: message.cover_url || ''
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
        music_link: parsedMusicLink || undefined,
        cover_url: editingMessage.cover_url || undefined
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
    const newMessage = { hours: 24, message: '', music_link: '', raw_music_link: '', cover_url: '' };
    const newIndex = localConfig.timeout_messages.length;
    setLocalConfig({
      ...localConfig,
      timeout_messages: [...localConfig.timeout_messages, { hours: 24, message: '', music_link: undefined, cover_url: undefined }]
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
      raw_music_url: localConfig.default_music_url || '',
      cover_url: localConfig.default_cover_url || ''
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
      default_music_url: parsedMusicLink || undefined,
      default_cover_url: defaultMessageData.cover_url || undefined
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
        raw_music_url: value,
        cover_url: defaultMessageData.cover_url || ''
      });
    } else if (editingMessage) {
      setEditingMessage({
        ...editingMessage,
        raw_music_link: value,
        cover_url: editingMessage.cover_url || ''
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
      <DefaultMessageDialog 
        isOpen={isEditingDefault}
        onClose={() => {
          setIsEditingDefault(false);
          setMusicLinkError(null);
          setParsedMusicLink(null);
        }}
        defaultMessageData={defaultMessageData}
        onDefaultMessageChange={setDefaultMessageData}
        onSave={handleSaveDefaultMessage}
        isSaving={isSaving}
        musicLinkError={musicLinkError}
        parsedMusicLink={parsedMusicLink}
        isParsingLink={isParsingLink}
        onMusicLinkChange={(value) => handleMusicLinkChange(value, true)}
      />

      {/* 超时状态编辑对话框 */}
      <TimeoutMessageDialog 
        isOpen={editingMessageIndex !== null}
        onClose={() => {
          setEditingMessageIndex(null);
          setEditingMessage(null);
          setMusicLinkError(null);
          setParsedMusicLink(null);
        }}
        timeoutMessage={editingMessage}
        onTimeoutMessageChange={setEditingMessage}
        onSave={handleSaveTimeoutMessage}
        onDelete={handleDeleteTimeoutMessage}
        isSaving={isSaving}
        musicLinkError={musicLinkError}
        parsedMusicLink={parsedMusicLink}
        isParsingLink={isParsingLink}
        onMusicLinkChange={(value) => handleMusicLinkChange(value)}
      />
    </>
  );
}; 