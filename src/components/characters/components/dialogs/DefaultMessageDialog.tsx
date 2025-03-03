import React from 'react';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DefaultMessage } from '@/types/displayConfig';

interface DefaultMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMessageData: DefaultMessage;
  onDefaultMessageChange: (data: DefaultMessage) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  musicLinkError: string | null;
  parsedMusicLink: string | null;
  isParsingLink: boolean;
  onMusicLinkChange: (value: string) => void;
}

export const DefaultMessageDialog: React.FC<DefaultMessageDialogProps> = ({
  isOpen,
  onClose,
  defaultMessageData,
  onDefaultMessageChange,
  onSave,
  isSaving,
  musicLinkError,
  parsedMusicLink,
  isParsingLink,
  onMusicLinkChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
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
            <div className="relative">
              <Input
                value={defaultMessageData.message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  onDefaultMessageChange({
                    ...defaultMessageData,
                    message: e.target.value
                  })
                }
                placeholder="例如：状态良好"
                className="pr-8"
              />
              {defaultMessageData.message && (
                <button
                  type="button"
                  onClick={() => onDefaultMessageChange({
                    ...defaultMessageData,
                    message: ''
                  })}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <Label>网易云音乐链接 - 非VIP（可选）</Label>
            <div className="relative">
              <Input
                value={defaultMessageData.raw_music_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  onMusicLinkChange(e.target.value)
                }
                placeholder="粘贴网易云音乐分享链接"
                className={musicLinkError ? "border-red-300 pr-8" : "pr-8"}
              />
              {isParsingLink ? (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : defaultMessageData.raw_music_url ? (
                <button
                  type="button"
                  onClick={() => {
                    onDefaultMessageChange({
                      ...defaultMessageData,
                      raw_music_url: ''
                    });
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
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
          
          <div>
            <Label>封面图片URL（可选）</Label>
            <div className="relative">
              <Input
                value={defaultMessageData.cover_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  onDefaultMessageChange({
                    ...defaultMessageData,
                    cover_url: e.target.value
                  })
                }
                placeholder="音乐封面图片URL"
                className="pr-8"
              />
              {defaultMessageData.cover_url && (
                <button
                  type="button"
                  onClick={() => onDefaultMessageChange({
                    ...defaultMessageData,
                    cover_url: ''
                  })}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* 音乐预览 */}
          {parsedMusicLink && (
            <div className="mt-4 border rounded-md p-3 bg-gray-50">
              <Label className="text-xs text-gray-500 mb-2 block">音乐预览</Label>
              <div className="w-full flex justify-center">
                {(() => {
                  // 确保使用HTTPS
                  let secureLink = parsedMusicLink.replace('http://', 'https://');
                  
                  // 检测是否为移动设备
                  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                  
                  // 检查是否是网易云音乐的outchain播放器链接
                  if (secureLink.includes('music.163.com/outchain/player')) {
                    if (isMobile) {
                      // 移动设备：添加/m/路径
                      secureLink = secureLink.replace('/outchain/', '/m/outchain/');
                    }
                  }
                  
                  return (
                    <iframe 
                      style={{ border: 0 }}
                      width={330} 
                      height={100} 
                      src={secureLink}
                      className="mx-auto"
                    ></iframe>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            取消
          </Button>
          <Button 
            onClick={onSave}
            disabled={isSaving || !!musicLinkError || isParsingLink}
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 