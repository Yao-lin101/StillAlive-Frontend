import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, TrashIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TimeoutMessage } from '@/types/displayConfig';
import { MusicPreview } from '../music/MusicPreview';
import { ClearableInput } from '../common/ClearableInput';

interface TimeoutMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timeoutMessage: TimeoutMessage | null;
  onTimeoutMessageChange: (data: TimeoutMessage) => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  isSaving: boolean;
  musicLinkError: string | null;
  parsedMusicLink: string | null;
  isParsingLink: boolean;
  onMusicLinkChange: (value: string) => void;
}

export const TimeoutMessageDialog: React.FC<TimeoutMessageDialogProps> = ({
  isOpen,
  onClose,
  timeoutMessage,
  onTimeoutMessageChange,
  onSave,
  onDelete,
  isSaving,
  musicLinkError,
  parsedMusicLink,
  isParsingLink,
  onMusicLinkChange,
}) => {
  const [timeError, setTimeError] = useState<string | null>(null);

  if (!timeoutMessage) return null;

  // 在保存时验证时间是否重复
  const validateTime = () => {
    const existingTimes = timeoutMessage.__parent?.timeout_messages
      ?.filter((_, index) => index !== timeoutMessage.__index)
      .map(msg => msg.hours) || [];
    
    if (existingTimes.includes(timeoutMessage.hours)) {
      setTimeError('已存在相同的超时时间配置');
      return false;
    }
    setTimeError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateTime()) {
      return;
    }
    await onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑超时状态</DialogTitle>
          <DialogDescription>
            设置超时时间和显示内容
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>超时时间（小时）</Label>
            <ClearableInput
              type="number"
              value={timeoutMessage.hours.toString()}
              onChange={(e) => {
                setTimeError(null); // 清除错误提示
                onTimeoutMessageChange({
                  ...timeoutMessage,
                  hours: parseInt(e.target.value) || 0
                });
              }}
              onClear={() => {
                setTimeError(null);
                onTimeoutMessageChange({
                  ...timeoutMessage,
                  hours: 0
                });
              }}
              error={!!timeError}
              placeholder="例如：24"
            />
            {timeError && (
              <p className="text-xs text-red-500 mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {timeError}
              </p>
            )}
          </div>
          
          <div>
            <Label>显示消息</Label>
            <ClearableInput
              value={timeoutMessage.message}
              maxLength={100}
              onChange={(e) => 
                onTimeoutMessageChange({
                  ...timeoutMessage,
                  message: e.target.value
                })
              }
              onClear={() => onTimeoutMessageChange({
                ...timeoutMessage,
                message: ''
              })}
              placeholder="超时后显示的消息"
            />
          </div>
          
          <div>
            <Label>网易云音乐链接 - 非VIP（可选）</Label>
            <div className="relative">
              {isParsingLink ? (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : null}
              <ClearableInput
                value={timeoutMessage.raw_music_link || ''}
                maxLength={150}
                onChange={(e) => onMusicLinkChange(e.target.value)}
                onClear={() => {
                  onTimeoutMessageChange({
                    ...timeoutMessage,
                    raw_music_link: ''
                  });
                }}
                error={!!musicLinkError}
                placeholder="粘贴网易云音乐分享链接"
              />
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
          {parsedMusicLink && <MusicPreview musicLink={parsedMusicLink} />}
        </div>
        
        <DialogFooter className="flex flex-row items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-500 border-red-200 hover:bg-red-50"
            disabled={isSaving}
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{isSaving ? '删除中...' : '删除'}</span>
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              取消
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !!musicLinkError || isParsingLink}
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 