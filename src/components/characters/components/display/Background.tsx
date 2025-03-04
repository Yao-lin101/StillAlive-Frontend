import React from 'react';
import { Meteors } from "@/components/magicui/meteors";

interface BackgroundProps {
  backgroundUrl?: string;
  overlayOpacity?: number;
  onBgImageError: () => void;
}

export const Background: React.FC<BackgroundProps> = ({
  backgroundUrl,
  overlayOpacity = 0.5,
  onBgImageError
}) => {
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
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, 
                rgba(0,0,0,${overlayOpacity}), 
                rgba(0,0,0,0))`
            }}
          />
        </>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <Meteors 
          number={30}
          className="text-white"
        />
      </div>
    </div>
  );
}; 