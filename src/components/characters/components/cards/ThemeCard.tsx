import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings2, Plus, Trash2, ImageIcon } from 'lucide-react';
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
  feathers_enabled: boolean;
  slideshow_interval: number;
}

// 辅助函数：将换行分隔的字符串解析为URL数组
const parseUrls = (urlString: string): string[] => {
  return urlString.split('\n').map(u => u.trim()).filter(Boolean);
};

// 辅助函数：将URL数组合并为换行分隔的字符串
const joinUrls = (urls: string[]): string => {
  return urls.filter(Boolean).join('\n');
};

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
    feathers_enabled: theme?.feathers_enabled ?? false,
    slideshow_interval: theme?.slideshow_interval ?? 5,
  });

  // 桌面端URL列表管理
  const [desktopUrls, setDesktopUrls] = useState<string[]>(() => {
    const urls = parseUrls(theme?.background_url || '');
    return urls.length > 0 ? urls : [''];
  });

  // 移动端URL列表管理
  const [mobileUrls, setMobileUrls] = useState<string[]>(() => {
    const urls = parseUrls(theme?.mobile_background_url || '');
    return urls.length > 0 ? urls : [''];
  });

  // 保存原始主题值，用于取消或关闭弹窗时重置
  const [originalTheme, setOriginalTheme] = useState<Theme>({
    background_url: theme?.background_url || '',
    mobile_background_url: theme?.mobile_background_url || '',
    overlay_opacity: typeof theme?.overlay_opacity === 'number' ? theme.overlay_opacity : 0,
    meteors_enabled: theme?.meteors_enabled ?? true,
    feathers_enabled: theme?.feathers_enabled ?? false,
    slideshow_interval: theme?.slideshow_interval ?? 5,
  });

  useEffect(() => {
    if (theme) {
      const updatedTheme = {
        background_url: theme.background_url || '',
        mobile_background_url: theme.mobile_background_url || '',
        overlay_opacity: typeof theme.overlay_opacity === 'number' ? theme.overlay_opacity : 0,
        meteors_enabled: theme.meteors_enabled ?? true,
        feathers_enabled: theme.feathers_enabled ?? false,
        slideshow_interval: theme.slideshow_interval ?? 5,
      };
      setLocalTheme(updatedTheme);
      setOriginalTheme(updatedTheme);

      const dUrls = parseUrls(theme.background_url || '');
      setDesktopUrls(dUrls.length > 0 ? dUrls : ['']);
      const mUrls = parseUrls(theme.mobile_background_url || '');
      setMobileUrls(mUrls.length > 0 ? mUrls : ['']);
    }
  }, [theme]);

  // 重置为原始值的函数
  const resetToOriginal = () => {
    setLocalTheme({ ...originalTheme });
    const dUrls = parseUrls(originalTheme.background_url);
    setDesktopUrls(dUrls.length > 0 ? dUrls : ['']);
    const mUrls = parseUrls(originalTheme.mobile_background_url);
    setMobileUrls(mUrls.length > 0 ? mUrls : ['']);
  };

  // 同步URL列表到localTheme
  const syncDesktopUrls = (urls: string[]) => {
    setDesktopUrls(urls);
    setLocalTheme(prev => ({ ...prev, background_url: joinUrls(urls) }));
  };

  const syncMobileUrls = (urls: string[]) => {
    setMobileUrls(urls);
    setLocalTheme(prev => ({ ...prev, mobile_background_url: joinUrls(urls) }));
  };

  // 计算当前有效URL数量
  const desktopUrlCount = desktopUrls.filter(Boolean).length;
  const mobileUrlCount = mobileUrls.filter(Boolean).length;
  const hasMultipleImages = desktopUrlCount > 1 || mobileUrlCount > 1;

  const handleSave = async () => {
    console.log('ThemeCard - Saving theme:', localTheme);
    const newConfig = {
      ...config,
      theme: localTheme
    };
    onUpdate(localTheme);
    await onSave(newConfig);

    // 保存成功后，更新原始值
    setOriginalTheme({ ...localTheme });
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
            {desktopUrlCount > 0
              ? `背景图片: ${desktopUrlCount}张${desktopUrlCount > 1 ? ' (幻灯片)' : ''}`
              : '背景图片: 未设置'
            }
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
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* 桌面端背景URL列表 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>桌面端背景图片URL</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => syncDesktopUrls([...desktopUrls, ''])}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加图片
                </Button>
              </div>
              <div className="space-y-2">
                {desktopUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <ClearableInput
                        value={url}
                        maxLength={300}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newUrls = [...desktopUrls];
                          newUrls[index] = e.target.value;
                          syncDesktopUrls(newUrls);
                        }}
                        onClear={() => {
                          const newUrls = [...desktopUrls];
                          newUrls[index] = '';
                          syncDesktopUrls(newUrls);
                        }}
                        placeholder="https://example.com/background.jpg"
                      />
                    </div>
                    {desktopUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => {
                          const newUrls = desktopUrls.filter((_, i) => i !== index);
                          syncDesktopUrls(newUrls.length > 0 ? newUrls : ['']);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {desktopUrlCount > 1
                  ? `已添加 ${desktopUrlCount} 张图片，将以幻灯片方式播放`
                  : '输入桌面端背景图片的URL地址，可添加多张进行幻灯片播放'
                }
              </p>
            </div>

            {/* 移动端背景URL列表 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>移动端背景图片URL（可选）</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => syncMobileUrls([...mobileUrls, ''])}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加图片
                </Button>
              </div>
              <div className="space-y-2">
                {mobileUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <ClearableInput
                        value={url}
                        maxLength={300}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newUrls = [...mobileUrls];
                          newUrls[index] = e.target.value;
                          syncMobileUrls(newUrls);
                        }}
                        onClear={() => {
                          const newUrls = [...mobileUrls];
                          newUrls[index] = '';
                          syncMobileUrls(newUrls);
                        }}
                        placeholder="https://example.com/mobile-bg.jpg"
                      />
                    </div>
                    {mobileUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => {
                          const newUrls = mobileUrls.filter((_, i) => i !== index);
                          syncMobileUrls(newUrls.length > 0 ? newUrls : ['']);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">输入移动端背景图片URL，如不设置则使用桌面端背景</p>
            </div>

            {/* 幻灯片间隔设置 - 仅在有多张图片时显示 */}
            {hasMultipleImages && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="slideshow_interval">幻灯片切换间隔</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="slideshow_interval"
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    value={localTheme.slideshow_interval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalTheme(prev => ({
                      ...prev,
                      slideshow_interval: parseInt(e.target.value)
                    }))}
                  />
                  <span className="text-sm text-gray-500 w-12">
                    {localTheme.slideshow_interval}秒
                  </span>
                </div>
                <p className="text-sm text-gray-500">设置背景图片自动切换的时间间隔（3-30秒）</p>
              </div>
            )}

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>羽毛飘落</Label>
                  <p className="text-sm text-muted-foreground">
                    开启或关闭背景羽毛飘落效果
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {localTheme.feathers_enabled ? '开启' : '关闭'}
                  </span>
                  <Switch
                    checked={localTheme.feathers_enabled}
                    onCheckedChange={(checked) => {
                      setLocalTheme(prev => ({
                        ...prev,
                        feathers_enabled: checked
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