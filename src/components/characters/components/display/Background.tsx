import React, { useState, useEffect } from 'react';
import { Meteors } from "@/components/magicui/meteors";

interface BackgroundTheme {
  background_url: string;
  mobile_background_url?: string;
  overlay_opacity: number;
  meteors_enabled?: boolean;
}

interface BackgroundProps {
  theme?: BackgroundTheme;
  onBgImageError: () => void;
}

export const Background: React.FC<BackgroundProps> = ({
  theme,
  onBgImageError
}) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(undefined);

  // 检测设备类型并设置对应的背景URL
  useEffect(() => {
    const checkMobileAndSetBackground = () => {
      if (!theme) return;
      
      // 根据设备类型选择背景URL
      if (window.innerWidth <= 768 && theme.mobile_background_url) {
        setBackgroundUrl(theme.mobile_background_url);
      } else {
        setBackgroundUrl(theme.background_url);
      }
    };
    
    checkMobileAndSetBackground();
    window.addEventListener('resize', checkMobileAndSetBackground);
    
    return () => window.removeEventListener('resize', checkMobileAndSetBackground);
  }, [theme]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {backgroundUrl && (
        <>
          <img 
            src={backgroundUrl} 
            alt="背景" 
            className="absolute inset-0 w-full h-full object-cover"
            onError={onBgImageError}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          {(theme?.meteors_enabled ?? true) && (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, 
                  rgba(0,0,0,${theme?.overlay_opacity}), 
                  rgba(0,0,0,0))`
              }}
            />
          )}
        </>
      )}
      {(theme?.meteors_enabled ?? true) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Meteors 
            number={30}
            className="text-white"
          />
        </div>
      )}
    </div>
  );
}; 