import React, { useState, useEffect, useRef } from 'react';
import { Meteors } from "@/components/magicui/meteors";
import { FeatherFall } from "@/components/effects/FeatherFall";

interface BackgroundItem {
  url: string;
  active?: boolean;
}

interface BackgroundTheme {
  background_url: string;
  mobile_background_url?: string;
  backgrounds?: BackgroundItem[];
  mobile_backgrounds?: BackgroundItem[];
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

      let urls: string[] = [];
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        if (theme.mobile_backgrounds && theme.mobile_backgrounds.length > 0) {
          urls = theme.mobile_backgrounds
            .filter(item => item.active !== false)
            .map(item => item.url)
            .filter(Boolean);
        } else if (theme.mobile_background_url) {
          urls = parseUrls(theme.mobile_background_url);
        }
      }

      // If mobile URLs are empty or it's not mobile, try desktop backgrounds
      if (urls.length === 0) {
        if (theme.backgrounds && theme.backgrounds.length > 0) {
          urls = theme.backgrounds
            .filter(item => item.active !== false)
            .map(item => item.url)
            .filter(Boolean);
        } else if (theme.background_url) {
          urls = parseUrls(theme.background_url);
        }
      }

      const urlString = urls.join('\n');

      // 如果背景URL没有实质变化（例如仅仅是手机浏览器滚动导致的resize），则不进行任何重置操作
      if (urlString !== lastUrlStringRef.current) {
        lastUrlStringRef.current = urlString;
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
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        isolation: 'isolate',
        // 清透水色系复合渐变底色
        background: `
          radial-gradient(at 0% 0%, #E0F7FA 0, transparent 50%),
          radial-gradient(at 100% 0%, #81D4FA 0, transparent 50%),
          radial-gradient(at 100% 100%, #E1F5FE 0, transparent 50%),
          radial-gradient(at 0% 100%, #B2EBF2 0, transparent 50%),
          #CCF3FF
        `
      }}
    >
      {/* 极细微颗粒感叠加，增加质感 */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-soft-light pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {hasImages && (
        <>
          {backgroundUrls.map((url, index) => {
            if (!mountedIndices.has(index)) return null;
            const isActive = index === activeIndices.current;

            return (
              <React.Fragment key={url}>
                {/* 氛围底层：同步安全属性以复用网络请求并避免 Referer 导致的 403 */}
                <img
                  src={url}
                  alt=""
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    filter: 'blur(80px) saturate(1.4) brightness(0.9)',
                    transform: 'scale(1.15)',
                    opacity: isActive ? 0.6 : 0,
                    transition: 'opacity 1.5s ease-in-out',
                    zIndex: 0
                  }}
                />
                {/* 清晰原图层 */}
                <img
                  key={url}
                  src={url}
                  alt="背景"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={isActive ? onBgImageError : undefined}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  decoding="async"
                  onLoad={() => {
                    if (!hasTriggeredLoadRef.current && onInitialLoad && isActive) {
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
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 1s ease-in-out',
                    zIndex: 1,
                    willChange: 'opacity',
                    // 为立绘增加微妙的投影，增强空间深度
                    filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.15))'
                  }}
                />
              </React.Fragment>
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