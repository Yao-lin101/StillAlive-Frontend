import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Settings2,  ChevronDown, ChevronUp } from 'lucide-react';
import { parseNeteaseMusicLink } from '@/utils/musicLinkParser';
import {
  DisplayConfig,
  TimeoutMessage,
  DefaultMessage,
  DisplayConfigCardProps
} from '@/types/displayConfig';
import { DefaultMessageDialog } from '../dialogs/DefaultMessageDialog';
import { TimeoutMessageDialog } from '../dialogs/TimeoutMessageDialog';
import { DefaultStatusSection } from './sections/DefaultStatusSection';
import { TimeoutMessagesSection } from './sections/TimeoutMessagesSection';

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
            <DefaultStatusSection 
              config={localConfig}
              onEdit={handleEditDefaultMessage}
            />
            
            <TimeoutMessagesSection 
              config={localConfig}
              onEdit={handleEditTimeoutMessage}
              onAdd={handleAddTimeoutMessage}
            />
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