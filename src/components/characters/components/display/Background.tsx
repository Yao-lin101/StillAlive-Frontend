import React, { useState, useEffect, useRef } from 'react';
import { Meteors } from "@/components/magicui/meteors";
import { FeatherFall } from "@/components/effects/FeatherFall";

interface BackgroundTheme {
  background_url: string;
  mobile_background_url?: string;
  overlay_opacity: number;
  meteors_enabled?: boolean;
  feathers_enabled?: boolean;
  slideshow_interval?: number;
}

interface BackgroundProps {
  theme?: BackgroundTheme;
  onBgImageError: () => void;
  onInitialLoad?: () => void;
}

// 将换行分隔的URL字符串解析为数组
const parseUrls = (urlString: string): string[] => {
  return urlString.split('\n').map(u => u.trim()).filter(Boolean);
};

export const Background: React.FC<BackgroundProps> = ({
  theme,
  onBgImageError,
  onInitialLoad
}) => {
  const [backgroundUrls, setBackgroundUrls] = useState<string[]>([]);
  // 使用单一状态管理当前展示和下一个预加载的索引
  const [activeIndices, setActiveIndices] = useState<{ current: number, next: number | null }>({ current: 0, next: null });
  const [mountedIndices, setMountedIndices] = useState<Set<number>>(new Set());
  const [initialImageLoaded, setInitialImageLoaded] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTriggeredLoadRef = useRef(false);

  const lastUrlStringRef = useRef<string | null>(null);

  // 检测设备类型并解析对应的背景URL列表
  useEffect(() => {
    const checkMobileAndSetBackground = () => {
      if (!theme) return;

      let urlString: string;
      if (window.innerWidth <= 768 && theme.mobile_background_url) {
        urlString = theme.mobile_background_url;
      } else {
        urlString = theme.background_url || '';
      }

      // 如果背景URL没有实质变化（例如仅仅是手机浏览器滚动导致的resize），则不进行任何重置操作
      if (urlString !== lastUrlStringRef.current) {
        lastUrlStringRef.current = urlString;
        const urls = parseUrls(urlString);
        setBackgroundUrls(urls);
        
        const first = urls.length > 1 ? Math.floor(Math.random() * urls.length) : 0;
        setActiveIndices({ current: first, next: null });
        setMountedIndices(new Set([first]));

        if (urls.length === 0 && onInitialLoad && !hasTriggeredLoadRef.current) {
          hasTriggeredLoadRef.current = true;
          onInitialLoad();
        }
      }
    };

    checkMobileAndSetBackground();
    window.addEventListener('resize', checkMobileAndSetBackground);

    return () => window.removeEventListener('resize', checkMobileAndSetBackground);
  }, [theme]);

  // 记录所有已挂载的索引，避免卸载导致淡出动画失效
  useEffect(() => {
    setMountedIndices(prev => {
      const nextSet = new Set(prev);
      nextSet.add(activeIndices.current);
      if (activeIndices.next !== null) {
        nextSet.add(activeIndices.next);
      }
      return nextSet;
    });
  }, [activeIndices]);

  // 幻灯片定时器 — 只有在第一张图片加载完毕后才开启
  useEffect(() => {
    if (backgroundUrls.length <= 1 || !initialImageLoaded) return;

    const interval = (theme?.slideshow_interval ?? 5) * 1000;

    intervalRef.current = setInterval(() => {
      setActiveIndices(prev => {
        const newCurrent = prev.next !== null ? prev.next : prev.current;
        let newNext: number;
        do {
          newNext = Math.floor(Math.random() * backgroundUrls.length);
        } while (newNext === newCurrent && backgroundUrls.length > 1);
        
        return { current: newCurrent, next: newNext };
      });
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [backgroundUrls.length, theme?.slideshow_interval, initialImageLoaded]);

  const hasImages = backgroundUrls.length > 0;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ isolation: 'isolate' }}>
      {hasImages && (
        <>
          {/* 渲染所有图片，通过 opacity 控制显示 */}
          {backgroundUrls.map((url, index) => {
            if (!mountedIndices.has(index)) return null;

            return (
              <img
                key={url}
                src={url}
                alt="背景"
                className="absolute inset-0 w-full h-full object-cover"
                onError={index === activeIndices.current ? onBgImageError : undefined}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                decoding="async"
                onLoad={() => {
                  if (!hasTriggeredLoadRef.current && onInitialLoad && index === activeIndices.current) {
                    hasTriggeredLoadRef.current = true;
                    setInitialImageLoaded(true);
                    
                    // 首图加载完毕后，立刻算出下一张并挂载，开始静默下载
                    if (backgroundUrls.length > 1) {
                      let nextTarget: number;
                      do {
                        nextTarget = Math.floor(Math.random() * backgroundUrls.length);
                      } while (nextTarget === activeIndices.current);
                      setActiveIndices(prev => ({ ...prev, next: nextTarget }));
                    }

                    onInitialLoad();
                  }
                }}
                style={{
                  opacity: index === activeIndices.current ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  zIndex: index === activeIndices.current ? 1 : 0,
                  willChange: 'opacity'
                }}
              />
            );
          })}

          {(theme?.meteors_enabled ?? true) && (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, 
                  rgba(0,0,0,${theme?.overlay_opacity}), 
                  rgba(0,0,0,0))`,
                zIndex: 2,
              }}
            />
          )}
        </>
      )}
      {initialImageLoaded && (theme?.meteors_enabled ?? true) && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
          <Meteors
            number={30}
            className="text-white"
          />
        </div>
      )}
      {initialImageLoaded && (theme?.feathers_enabled ?? false) && (
        <div className="absolute inset-0" style={{ zIndex: 4, pointerEvents: 'none' }}>
          <FeatherFall />
        </div>
      )}
    </div>
  );
};