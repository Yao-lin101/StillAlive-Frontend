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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 确定要使用的背景URL
  const currentBackgroundUrl = theme && isMobile && theme.mobile_background_url 
    ? theme.mobile_background_url 
    : theme?.background_url;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {currentBackgroundUrl && (
        <>
          <img 
            src={currentBackgroundUrl} 
            alt="背景" 
            className="absolute inset-0 w-full h-full object-cover"
            onError={onBgImageError}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          {theme?.meteors_enabled && (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, 
                  rgba(0,0,0,${theme.overlay_opacity}), 
                  rgba(0,0,0,0))`
              }}
            />
          )}
        </>
      )}
      {theme?.meteors_enabled && (
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