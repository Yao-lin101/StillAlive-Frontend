import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings2 } from 'lucide-react';
import { ClearableInput } from '../common/ClearableInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Theme {
  background_url: string;
  mobile_background_url: string;
  overlay_opacity: number;
  meteors_enabled: boolean;
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
    mobile_background_url: theme?.mobile_background_url || '',
    overlay_opacity: typeof theme?.overlay_opacity === 'number' ? theme.overlay_opacity : 0,
    meteors_enabled: theme?.meteors_enabled ?? true,
  });
  
  // 保存原始主题值，用于取消或关闭弹窗时重置
  const [originalTheme, setOriginalTheme] = useState<Theme>({
    background_url: theme?.background_url || '',
    mobile_background_url: theme?.mobile_background_url || '',
    overlay_opacity: typeof theme?.overlay_opacity === 'number' ? theme.overlay_opacity : 0,
    meteors_enabled: theme?.meteors_enabled ?? true,
  });

  useEffect(() => {
    if (theme) {
      const updatedTheme = {
        background_url: theme.background_url || '',
        mobile_background_url: theme.mobile_background_url || '',
        overlay_opacity: typeof theme.overlay_opacity === 'number' ? theme.overlay_opacity : 0,
        meteors_enabled: theme.meteors_enabled ?? true,
      };
      setLocalTheme(updatedTheme);
      setOriginalTheme(updatedTheme);
    }
  }, [theme]);
  
  // 重置为原始值的函数
  const resetToOriginal = () => {
    setLocalTheme({...originalTheme});
  };

  const handleSave = async () => {
    console.log('ThemeCard - Saving theme:', localTheme);
    const newConfig = {
      ...config,
      theme: localTheme
    };
    onUpdate(localTheme);
    await onSave(newConfig);
    
    // 保存成功后，更新原始值
    setOriginalTheme({...localTheme});
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

      <Dialog 
        open={isEditing} 
        onOpenChange={(open) => {
          if (!open) {
            // 当弹窗关闭时（无论通过什么方式），重置为原始值
            resetToOriginal();
          }
          setIsEditing(open);
        }}
      >
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
              <ClearableInput
                id="background_url"
                value={localTheme.background_url}
                maxLength={150}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalTheme({
                  ...localTheme,
                  background_url: e.target.value
                })}
                onClear={() => setLocalTheme({
                  ...localTheme,
                  background_url: ''
                })}
                placeholder="https://example.com/background.jpg"
              />
              <p className="text-sm text-gray-500">输入桌面端背景图片的URL地址</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_background_url">移动端背景图片URL（可选）</Label>
              <ClearableInput
                id="mobile_background_url"
                value={localTheme.mobile_background_url}
                maxLength={150}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalTheme({
                  ...localTheme,
                  mobile_background_url: e.target.value
                })}
                onClear={() => setLocalTheme({
                  ...localTheme,
                  mobile_background_url: ''
                })}
                placeholder="https://example.com/mobile-background.jpg"
              />
              <p className="text-sm text-gray-500">输入移动端背景图片的URL地址，如果不设置则使用桌面端背景</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overlay_opacity">顶部遮罩透明度</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="overlay_opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                  value={localTheme.overlay_opacity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalTheme(prev => ({
                    ...prev,
                    overlay_opacity: parseFloat(e.target.value)
                  }))}
                />
                <span className="text-sm text-gray-500 w-12">
                  {Math.round(localTheme.overlay_opacity * 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-500">调整顶部遮罩的透明度，较深的遮罩可以让流星特效更明显</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>流星特效</Label>
                  <p className="text-sm text-muted-foreground">
                    开启或关闭背景流星特效
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {localTheme.meteors_enabled ? '开启' : '关闭'}
                  </span>
                  <Switch
                    checked={localTheme.meteors_enabled}
                    onCheckedChange={(checked) => {
                      setLocalTheme(prev => ({
                        ...prev,
                        meteors_enabled: checked
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetToOriginal();
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