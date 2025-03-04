import React, { useState, useEffect } from 'react';
import { Meteors } from "@/components/magicui/meteors";

interface BackgroundProps {
  backgroundUrl?: string;
  mobileBackgroundUrl?: string;
  overlayOpacity?: number;
  meteorsEnabled?: boolean;
  onBgImageError: () => void;
}

export const Background: React.FC<BackgroundProps> = ({
  backgroundUrl,
  mobileBackgroundUrl,
  overlayOpacity = 0.5,
  meteorsEnabled = true,
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
  const currentBackgroundUrl = isMobile && mobileBackgroundUrl ? mobileBackgroundUrl : backgroundUrl;

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
          {meteorsEnabled && (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, 
                  rgba(0,0,0,${overlayOpacity}), 
                  rgba(0,0,0,0))`
              }}
            />
          )}
        </>
      )}
      {meteorsEnabled && (
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