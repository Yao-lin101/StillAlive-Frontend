import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Theme {
  background_url: string;
  background_overlay: string;
  accent_color: string;
}

interface ThemeCardProps {
  theme?: Partial<Theme>;
  config: any;
  onUpdate: (theme: Theme) => void;
  onSave: (config: any) => Promise<void>;
  isSaving: boolean;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  config,
  onUpdate,
  onSave,
  isSaving
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTheme, setLocalTheme] = useState<Theme>({
    background_url: theme?.background_url || '',
    background_overlay: theme?.background_overlay || 'from-gray-900/95 to-gray-800/95',
    accent_color: theme?.accent_color || 'from-blue-400 to-purple-400'
  });

  useEffect(() => {
    setLocalTheme({
      background_url: theme?.background_url || '',
      background_overlay: theme?.background_overlay || 'from-gray-900/95 to-gray-800/95',
      accent_color: theme?.accent_color || 'from-blue-400 to-purple-400'
    });
  }, [theme]);

  const handleSave = async () => {
    console.log('ThemeCard - Saving theme:', localTheme);
    const newConfig = {
      ...config,
      theme: localTheme
    };
    onUpdate(localTheme);
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
          <h5 className="text-sm font-medium">背景主题设置</h5>
          <p className="text-sm text-gray-500 truncate w-full">
            背景图片: {localTheme.background_url || '未设置'}
          </p>
          <Settings2 className="h-4 w-4 text-gray-400 mt-2" />
        </div>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑背景主题</DialogTitle>
            <DialogDescription>
              设置展示页面的背景图片和主题
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="background_url">背景图片URL</Label>
              <Input
                id="background_url"
                value={localTheme.background_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalTheme({
                  ...localTheme,
                  background_url: e.target.value
                })}
                placeholder="https://example.com/background.jpg"
              />
              <p className="text-sm text-gray-500">输入图片的URL地址</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setLocalTheme({
                    background_url: '',
                    background_overlay: 'from-gray-900/95 to-gray-800/95',
                    accent_color: 'from-blue-400 to-purple-400'
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