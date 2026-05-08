import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings2, Plus, Trash2, ImageIcon, Eye, EyeOff, CheckSquare, Square, Check } from 'lucide-react';
import { ClearableInput } from '../common/ClearableInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface BackgroundItem {
  url: string;
  active: boolean;
}

interface Theme {
  background_url: string;
  mobile_background_url: string;
  backgrounds?: BackgroundItem[];
  mobile_backgrounds?: BackgroundItem[];
  overlay_opacity: number;
  meteors_enabled: boolean;
  feathers_enabled: boolean;
  slideshow_interval: number;
}

// 辅助函数：将换行分隔的字符串解析为URL数组
const parseUrls = (urlString: string): string[] => {
  return urlString.split('\n').map(u => u.trim()).filter(Boolean);
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
  const [desktopItems, setDesktopItems] = useState<BackgroundItem[]>(() => {
    if (theme?.backgrounds && theme.backgrounds.length > 0) {
      return theme.backgrounds;
    }
    const urls = parseUrls(theme?.background_url || '');
    return urls.length > 0 ? urls.map(url => ({ url, active: true })) : [{ url: '', active: true }];
  });

  // 移动端URL列表管理
  const [mobileItems, setMobileItems] = useState<BackgroundItem[]>(() => {
    if (theme?.mobile_backgrounds && theme.mobile_backgrounds.length > 0) {
      return theme.mobile_backgrounds;
    }
    const urls = parseUrls(theme?.mobile_background_url || '');
    return urls.length > 0 ? urls.map(url => ({ url, active: true })) : [{ url: '', active: true }];
  });

  // 批量选择状态
  const [selectedDesktop, setSelectedDesktop] = useState<Set<number>>(new Set());
  const [selectedMobile, setSelectedMobile] = useState<Set<number>>(new Set());

  // 保存原始主题值，用于取消或关闭弹窗时重置
  const [originalTheme, setOriginalTheme] = useState<Theme>({
    background_url: theme?.background_url || '',
    mobile_background_url: theme?.mobile_background_url || '',
    overlay_opacity: typeof theme?.overlay_opacity === 'number' ? theme.overlay_opacity : 0,
    meteors_enabled: theme?.meteors_enabled ?? true,
    feathers_enabled: theme?.feathers_enabled ?? false,
    slideshow_interval: theme?.slideshow_interval ?? 5,
  });

  const [editingImage, setEditingImage] = useState<{ type: 'desktop' | 'mobile'; index: number } | null>(null);

  useEffect(() => {
    if (theme) {
      const updatedTheme = {
        background_url: theme.background_url || '',
        mobile_background_url: theme.mobile_background_url || '',
        backgrounds: theme.backgrounds || [],
        mobile_backgrounds: theme.mobile_backgrounds || [],
        overlay_opacity: typeof theme.overlay_opacity === 'number' ? theme.overlay_opacity : 0,
        meteors_enabled: theme.meteors_enabled ?? true,
        feathers_enabled: theme.feathers_enabled ?? false,
        slideshow_interval: theme.slideshow_interval ?? 5,
      };
      setLocalTheme(updatedTheme);
      setOriginalTheme(updatedTheme);

      if (theme.backgrounds && theme.backgrounds.length > 0) {
        setDesktopItems(theme.backgrounds);
      } else {
        const dUrls = parseUrls(theme.background_url || '');
        setDesktopItems(dUrls.length > 0 ? dUrls.map(url => ({ url, active: true })) : [{ url: '', active: true }]);
      }

      if (theme.mobile_backgrounds && theme.mobile_backgrounds.length > 0) {
        setMobileItems(theme.mobile_backgrounds);
      } else {
        const mUrls = parseUrls(theme.mobile_background_url || '');
        setMobileItems(mUrls.length > 0 ? mUrls.map(url => ({ url, active: true })) : [{ url: '', active: true }]);
      }
    }
  }, [theme]);

  // 重置为原始值的函数
  const resetToOriginal = () => {
    setLocalTheme({ ...originalTheme });

    if (originalTheme.backgrounds && originalTheme.backgrounds.length > 0) {
      setDesktopItems(originalTheme.backgrounds);
    } else {
      const dUrls = parseUrls(originalTheme.background_url);
      setDesktopItems(dUrls.length > 0 ? dUrls.map(url => ({ url, active: true })) : [{ url: '', active: true }]);
    }

    if (originalTheme.mobile_backgrounds && originalTheme.mobile_backgrounds.length > 0) {
      setMobileItems(originalTheme.mobile_backgrounds);
    } else {
      const mUrls = parseUrls(originalTheme.mobile_background_url);
      setMobileItems(mUrls.length > 0 ? mUrls.map(url => ({ url, active: true })) : [{ url: '', active: true }]);
    }
    setSelectedDesktop(new Set());
    setSelectedMobile(new Set());
  };

  // 同步URL列表到localTheme
  const syncDesktopItems = (items: BackgroundItem[]) => {
    setDesktopItems(items);
    setLocalTheme(prev => ({
      ...prev,
      backgrounds: items,
      background_url: items.map(i => i.url).filter(Boolean).join('\n')
    }));
  };

  const syncMobileItems = (items: BackgroundItem[]) => {
    setMobileItems(items);
    setLocalTheme(prev => ({
      ...prev,
      mobile_backgrounds: items,
      mobile_background_url: items.map(i => i.url).filter(Boolean).join('\n')
    }));
  };

  // 计算当前有效URL数量
  const desktopUrlCount = desktopItems.filter(i => i.url).length;
  const mobileUrlCount = mobileItems.filter(i => i.url).length;
  const activeDesktopCount = desktopItems.filter(i => i.url && i.active).length;
  const activeMobileCount = mobileItems.filter(i => i.url && i.active).length;
  const hasMultipleImages = activeDesktopCount > 1 || activeMobileCount > 1;

  const handleSave = async () => {
    console.log('ThemeCard - Saving theme:', localTheme);
    const themeToSave = {
      ...localTheme,
      backgrounds: desktopItems,
      mobile_backgrounds: mobileItems
    };
    const newConfig = {
      ...config,
      theme: themeToSave
    };
    onUpdate(themeToSave);
    await onSave(newConfig);
    toast.success('背景主题配置已保存');

    // 保存成功后，更新原始值
    setOriginalTheme({ ...themeToSave });
    setIsEditing(false);
  };

  const toggleSelect = (type: 'desktop' | 'mobile', index: number) => {
    const set = type === 'desktop' ? new Set(selectedDesktop) : new Set(selectedMobile);
    if (set.has(index)) {
      set.delete(index);
    } else {
      set.add(index);
    }
    type === 'desktop' ? setSelectedDesktop(set) : setSelectedMobile(set);
  };

  const toggleSelectAll = (type: 'desktop' | 'mobile') => {
    const items = type === 'desktop' ? desktopItems : mobileItems;
    const selected = type === 'desktop' ? selectedDesktop : selectedMobile;
    if (selected.size === items.length && items.length > 0) {
      type === 'desktop' ? setSelectedDesktop(new Set()) : setSelectedMobile(new Set());
    } else {
      const newSet = new Set(items.map((_, i) => i));
      type === 'desktop' ? setSelectedDesktop(newSet) : setSelectedMobile(newSet);
    }
  };

  const handleBatchToggleActive = (type: 'desktop' | 'mobile', active: boolean) => {
    if (type === 'desktop') {
      const newItems = desktopItems.map((item, i) =>
        selectedDesktop.has(i) ? { ...item, active } : item
      );
      syncDesktopItems(newItems);
      setSelectedDesktop(new Set());
    } else {
      const newItems = mobileItems.map((item, i) =>
        selectedMobile.has(i) ? { ...item, active } : item
      );
      syncMobileItems(newItems);
      setSelectedMobile(new Set());
    }
  };

  const handleBatchDelete = (type: 'desktop' | 'mobile') => {
    const count = type === 'desktop' ? selectedDesktop.size : selectedMobile.size;
    if (window.confirm(`确定要删除选中的 ${count} 张图片吗？`)) {
      if (type === 'desktop') {
        const newItems = desktopItems.filter((_, i) => !selectedDesktop.has(i));
        syncDesktopItems(newItems.length > 0 ? newItems : [{ url: '', active: true }]);
        setSelectedDesktop(new Set());
      } else {
        const newItems = mobileItems.filter((_, i) => !selectedMobile.has(i));
        syncMobileItems(newItems.length > 0 ? newItems : [{ url: '', active: true }]);
        setSelectedMobile(new Set());
      }
    }
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
              ? `背景图片: ${desktopUrlCount}张 (${activeDesktopCount}张激活)`
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
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {/* 桌面端背景URL列表 */}
            <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Label className="font-bold">桌面端背景 ({activeDesktopCount}/{desktopUrlCount})</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs bg-transparent"
                    onClick={() => toggleSelectAll('desktop')}
                  >
                    {selectedDesktop.size === desktopItems.length && desktopItems.length > 0 ? <CheckSquare className="h-3 w-3 mr-1" /> : <Square className="h-3 w-3 mr-1" />}
                    全选
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary bg-transparent"
                    onClick={() => {
                      const newItems = [...desktopItems, { url: '', active: true }];
                      syncDesktopItems(newItems);
                      setEditingImage({ type: 'desktop', index: newItems.length - 1 });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加
                  </Button>
                </div>
              </div>

              {/* 批量操作栏 */}
              {selectedDesktop.size > 0 && (
                <div className="flex items-center gap-2 py-1.5 px-2 bg-primary/10 dark:bg-primary/20 rounded-md mb-2 animate-in fade-in slide-in-from-top-1 border border-primary/20 dark:border-primary/40">
                  <span className="text-[10px] font-medium text-primary dark:text-primary-foreground/90 mr-auto pl-1">已选 {selectedDesktop.size} 项</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] hover:bg-primary/20 dark:text-primary-foreground/80 dark:hover:text-white" onClick={() => handleBatchToggleActive('desktop', true)}>
                    <Eye className="h-3 w-3 mr-1" /> 激活
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] hover:bg-primary/20 dark:text-primary-foreground/80 dark:hover:text-white" onClick={() => handleBatchToggleActive('desktop', false)}>
                    <EyeOff className="h-3 w-3 mr-1" /> 隐藏
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleBatchDelete('desktop')}>
                    <Trash2 className="h-3 w-3 mr-1" /> 删除
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {desktopItems.map((item, index) => (
                  <div
                    key={index}
                    className={`relative group aspect-video bg-muted rounded-md border overflow-hidden transition-all ${!item.active ? 'opacity-60 grayscale-[0.5]' : ''} ${selectedDesktop.has(index) ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}`}
                  >
                    {/* 选择框 */}
                    <div
                      className={`absolute top-2 left-2 z-20 w-5 h-5 rounded border shadow-sm flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedDesktop.has(index) ? 'bg-primary border-primary scale-110' : 'bg-white/90 dark:bg-zinc-800/90 border-gray-400 dark:border-zinc-600 hover:border-primary group-hover:scale-105'}`}
                      onClick={(e) => { e.stopPropagation(); toggleSelect('desktop', index); }}
                    >
                      {selectedDesktop.has(index) ? (
                        <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3px]" />
                      ) : (
                        <div className="w-1.5 h-1.5 bg-gray-400/50 rounded-full group-hover:bg-primary/50" />
                      )}
                    </div>

                    {/* 状态标识 */}
                    <div className="absolute top-1.5 right-1.5 z-10 flex gap-1">
                      {!item.active && (
                        <div className="bg-black/60 text-white rounded-full px-1.5 py-0.5 text-[8px] flex items-center backdrop-blur-sm">
                          <EyeOff className="h-2 w-2 mr-0.5" /> 已隐藏
                        </div>
                      )}
                    </div>

                    {item.url ? (
                      <img
                        src={item.url}
                        alt={`Background ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => {
                          if (selectedDesktop.size > 0) {
                            toggleSelect('desktop', index);
                          } else {
                            setEditingImage({ type: 'desktop', index });
                          }
                        }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => {
                          if (selectedDesktop.size > 0) {
                            toggleSelect('desktop', index);
                          } else {
                            setEditingImage({ type: 'desktop', index });
                          }
                        }}
                      >
                        <Plus className="h-6 w-6 text-muted-foreground/50 mb-1" />
                        <span className="text-[10px] text-muted-foreground">设置图片</span>
                      </div>
                    )}

                    {/* 操作浮层 - 仅在非批量选择模式下展示 */}
                    {selectedDesktop.size === 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-5 py-2 backdrop-blur-md border-t border-white/10">
                        <button title={item.active ? "隐藏" : "激活"} onClick={(e) => {
                          e.stopPropagation();
                          const newItems = [...desktopItems];
                          newItems[index].active = !newItems[index].active;
                          syncDesktopItems(newItems);
                        }} className="text-white hover:text-white transition-colors p-1.5 hover:bg-white/20 rounded-full bg-white/5">
                          {item.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button title="删除" onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('确定要删除这张图片吗？')) {
                            const newItems = desktopItems.filter((_, i) => i !== index);
                            syncDesktopItems(newItems.length > 0 ? newItems : [{ url: '', active: true }]);
                            const newSelected = new Set(selectedDesktop);
                            newSelected.delete(index);
                            setSelectedDesktop(newSelected);
                          }
                        }} className="text-red-400 hover:text-red-300 transition-colors p-1.5 hover:bg-red-400/20 rounded-full bg-red-400/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 pt-1">
                {activeDesktopCount > 1
                  ? `已启用 ${activeDesktopCount} 张图片，将随机循环展示`
                  : '添加并激活背景图片，关闭"激活"可在不删除的情况下暂时隐藏'
                }
              </p>
            </div>

            {/* 移动端背景URL列表 */}
            <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Label className="font-bold">移动端背景 ({activeMobileCount}/{mobileUrlCount})</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs bg-transparent"
                    onClick={() => toggleSelectAll('mobile')}
                  >
                    {selectedMobile.size === mobileItems.length && mobileItems.length > 0 ? <CheckSquare className="h-3 w-3 mr-1" /> : <Square className="h-3 w-3 mr-1" />}
                    全选
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary bg-transparent"
                    onClick={() => {
                      const newItems = [...mobileItems, { url: '', active: true }];
                      syncMobileItems(newItems);
                      setEditingImage({ type: 'mobile', index: newItems.length - 1 });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加
                  </Button>
                </div>
              </div>

              {/* 批量操作栏 */}
              {selectedMobile.size > 0 && (
                <div className="flex items-center gap-2 py-1.5 px-2 bg-primary/10 dark:bg-primary/20 rounded-md mb-2 animate-in fade-in slide-in-from-top-1 border border-primary/20 dark:border-primary/40">
                  <span className="text-[10px] font-medium text-primary dark:text-primary-foreground/90 mr-auto pl-1">已选 {selectedMobile.size} 项</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] hover:bg-primary/20 dark:text-primary-foreground/80 dark:hover:text-white" onClick={() => handleBatchToggleActive('mobile', true)}>
                    <Eye className="h-3 w-3 mr-1" /> 激活
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] hover:bg-primary/20 dark:text-primary-foreground/80 dark:hover:text-white" onClick={() => handleBatchToggleActive('mobile', false)}>
                    <EyeOff className="h-3 w-3 mr-1" /> 隐藏
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleBatchDelete('mobile')}>
                    <Trash2 className="h-3 w-3 mr-1" /> 删除
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {mobileItems.map((item, index) => (
                  <div
                    key={index}
                    className={`relative group aspect-[9/16] bg-muted rounded-md border overflow-hidden transition-all ${!item.active ? 'opacity-60 grayscale-[0.5]' : ''} ${selectedMobile.has(index) ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}`}
                  >
                    {/* 选择框 */}
                    <div
                      className={`absolute top-2 left-2 z-20 w-5 h-5 rounded border shadow-sm flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedMobile.has(index) ? 'bg-primary border-primary scale-110' : 'bg-white/90 dark:bg-zinc-800/90 border-gray-400 dark:border-zinc-600 hover:border-primary group-hover:scale-105'}`}
                      onClick={(e) => { e.stopPropagation(); toggleSelect('mobile', index); }}
                    >
                      {selectedMobile.has(index) ? (
                        <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3px]" />
                      ) : (
                        <div className="w-1.5 h-1.5 bg-gray-400/50 rounded-full group-hover:bg-primary/50" />
                      )}
                    </div>

                    {/* 状态标识 */}
                    <div className="absolute top-1.5 right-1.5 z-10 flex gap-1">
                      {!item.active && (
                        <div className="bg-black/60 text-white rounded-full px-1 py-0.5 text-[7px] flex items-center backdrop-blur-sm">
                          <EyeOff className="h-2 w-2 mr-0.5" /> 隐藏
                        </div>
                      )}
                    </div>

                    {item.url ? (
                      <img
                        src={item.url}
                        alt={`Mobile Background ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => {
                          if (selectedMobile.size > 0) {
                            toggleSelect('mobile', index);
                          } else {
                            setEditingImage({ type: 'mobile', index });
                          }
                        }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => {
                          if (selectedMobile.size > 0) {
                            toggleSelect('mobile', index);
                          } else {
                            setEditingImage({ type: 'mobile', index });
                          }
                        }}
                      >
                        <Plus className="h-6 w-6 text-muted-foreground/50 mb-1" />
                        <span className="text-[10px] text-muted-foreground">设置</span>
                      </div>
                    )}

                    {/* 操作浮层 - 仅在非批量选择模式下展示 */}
                    {selectedMobile.size === 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-4 py-2 backdrop-blur-md border-t border-white/10">
                        <button title={item.active ? "隐藏" : "激活"} onClick={(e) => {
                          e.stopPropagation();
                          const newItems = [...mobileItems];
                          newItems[index].active = !newItems[index].active;
                          syncMobileItems(newItems);
                        }} className="text-white hover:text-white transition-colors p-1.5 hover:bg-white/20 rounded-full bg-white/5">
                          {item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button title="删除" onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('确定要删除这张图片吗？')) {
                            const newItems = mobileItems.filter((_, i) => i !== index);
                            syncMobileItems(newItems.length > 0 ? newItems : [{ url: '', active: true }]);
                            const newSelected = new Set(selectedMobile);
                            newSelected.delete(index);
                            setSelectedMobile(newSelected);
                          }
                        }} className="text-red-400 hover:text-red-300 transition-colors p-1.5 hover:bg-red-400/20 rounded-full bg-red-400/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 pt-1">如不设置移动端背景则使用桌面端背景</p>
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

          </div>
          <DialogFooter className="mt-4">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingImage} onOpenChange={(open) => !open && setEditingImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingImage?.type === 'desktop' ? '编辑桌面端背景' : '编辑移动端背景'}</DialogTitle>
            <DialogDescription>
              输入图片URL地址，支持网络图片
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingImage && (
              <>
                <div className={`relative rounded-md overflow-hidden bg-muted border mx-auto ${editingImage.type === 'desktop' ? 'aspect-video w-full' : 'max-h-[300px] aspect-[9/16] w-1/2'}`}>
                  {(editingImage.type === 'desktop' ? desktopItems : mobileItems)[editingImage.index]?.url ? (
                    <img
                      src={(editingImage.type === 'desktop' ? desktopItems : mobileItems)[editingImage.index].url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      <ImageIcon className="h-8 w-8 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>图片URL</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {(editingImage.type === 'desktop' ? desktopItems : mobileItems)[editingImage.index]?.active ? '已启用' : '已隐藏'}
                      </span>
                      <Switch
                        checked={(editingImage.type === 'desktop' ? desktopItems : mobileItems)[editingImage.index]?.active ?? true}
                        onCheckedChange={(checked) => {
                          if (editingImage.type === 'desktop') {
                            const newItems = [...desktopItems];
                            newItems[editingImage.index] = { ...newItems[editingImage.index], active: checked };
                            syncDesktopItems(newItems);
                          } else {
                            const newItems = [...mobileItems];
                            newItems[editingImage.index] = { ...newItems[editingImage.index], active: checked };
                            syncMobileItems(newItems);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <ClearableInput
                    value={(editingImage.type === 'desktop' ? desktopItems : mobileItems)[editingImage.index]?.url || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      if (editingImage.type === 'desktop') {
                        const newItems = [...desktopItems];
                        newItems[editingImage.index] = { ...newItems[editingImage.index], url: val };
                        syncDesktopItems(newItems);
                      } else {
                        const newItems = [...mobileItems];
                        newItems[editingImage.index] = { ...newItems[editingImage.index], url: val };
                        syncMobileItems(newItems);
                      }
                    }}
                    onClear={() => {
                      if (editingImage.type === 'desktop') {
                        const newItems = [...desktopItems];
                        newItems[editingImage.index] = { ...newItems[editingImage.index], url: '' };
                        syncDesktopItems(newItems);
                      } else {
                        const newItems = [...mobileItems];
                        newItems[editingImage.index] = { ...newItems[editingImage.index], url: '' };
                        syncMobileItems(newItems);
                      }
                    }}
                    placeholder={editingImage.type === 'desktop' ? "https://example.com/background.jpg" : "https://example.com/mobile-bg.jpg"}
                    className="dark:bg-muted/30"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setEditingImage(null)}>
                完成
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 