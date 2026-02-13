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
}

// 将换行分隔的URL字符串解析为数组
const parseUrls = (urlString: string): string[] => {
  return urlString.split('\n').map(u => u.trim()).filter(Boolean);
};

export const Background: React.FC<BackgroundProps> = ({
  theme,
  onBgImageError
}) => {
  const [backgroundUrls, setBackgroundUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 检测设备类型并解析对应的背景URL列表
  useEffect(() => {
    const checkMobileAndSetBackground = () => {
      if (!theme) return;

      let urlString: string;
      if (window.innerWidth <= 768 && theme.mobile_background_url) {
        urlString = theme.mobile_background_url;
      } else {
        urlString = theme.background_url;
      }

      const urls = parseUrls(urlString);
      setBackgroundUrls(urls);
      // 随机起始图片
      setCurrentIndex(urls.length > 1 ? Math.floor(Math.random() * urls.length) : 0);
    };

    checkMobileAndSetBackground();
    window.addEventListener('resize', checkMobileAndSetBackground);

    return () => window.removeEventListener('resize', checkMobileAndSetBackground);
  }, [theme]);

  // 幻灯片定时器 — 简单地切换 currentIndex
  useEffect(() => {
    if (backgroundUrls.length <= 1) return;

    const interval = (theme?.slideshow_interval ?? 5) * 1000;

    intervalRef.current = setInterval(() => {
      // 随机选择下一张（排除当前图片，避免连续重复）
      setCurrentIndex(prev => {
        let next: number;
        do {
          next = Math.floor(Math.random() * backgroundUrls.length);
        } while (next === prev && backgroundUrls.length > 1);
        return next;
      });
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [backgroundUrls.length, theme?.slideshow_interval]);

  const hasImages = backgroundUrls.length > 0;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ isolation: 'isolate' }}>
      {hasImages && (
        <>
          {/* 渲染所有图片，通过 opacity 控制显示 */}
          {backgroundUrls.map((url, index) => (
            <img
              key={url}
              src={url}
              alt="背景"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: index === currentIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: index === currentIndex ? 1 : 0,
              }}
              onError={index === currentIndex ? onBgImageError : undefined}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ))}

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
      {(theme?.meteors_enabled ?? true) && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
          <Meteors
            number={30}
            className="text-white"
          />
        </div>
      )}
      {(theme?.feathers_enabled ?? false) && (
        <div className="absolute inset-0" style={{ zIndex: 4, pointerEvents: 'none' }}>
          <FeatherFall />
        </div>
      )}
    </div>
  );
};