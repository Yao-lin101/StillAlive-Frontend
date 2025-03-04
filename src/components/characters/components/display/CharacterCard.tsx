import React from 'react';
import { Card } from '@/components/ui/card';
import { ShineBorder } from "@/components/magicui/shine-border";
import { Marquee } from "@/components/magicui/marquee";
import { StatusCard } from './StatusCard';

interface StatusItem {
  key: string;
  config: {
    label: string;
    description?: string;
    valueType: string;
    suffix?: string;
  };
  value: string | number;
}

interface CharacterCardProps {
  name: string;
  avatar: string | null;
  bio: string | null;
  statusMessage?: string;
  lastUpdate?: string;
  statusItems?: StatusItem[];
  onStatusClick?: () => void;
  onHideClick: (e: React.MouseEvent) => void;
  isMusicPlaying?: boolean;
  onMusicToggle?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  avatar,
  bio,
  statusMessage,
  lastUpdate,
  statusItems,
  onStatusClick,
  onHideClick,
  isMusicPlaying,
  onMusicToggle
}) => {
  return (
    <Card className="relative w-[calc(100vw-2rem)] sm:w-full max-w-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
      <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {onMusicToggle && (
          <button
            onClick={onMusicToggle}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            title={isMusicPlaying ? "暂停音乐" : "播放音乐"}
          >
            {isMusicPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>
        )}
        <button
          onClick={onHideClick}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          title="隐藏信息"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
      </div>
      <div className="p-8">
        <div className="flex items-center space-x-6 mb-8">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-white/50"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white/50">
              <span className="text-4xl font-bold text-gray-400">
                {name[0]}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-left">
              {name}
            </h1>
            {bio && (
              <p className="mt-2 text-gray-600 text-left">
                {bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          {statusMessage && (
            <p className="text-lg font-semibold text-gray-900">
              {statusMessage}
            </p>
          )}
          {lastUpdate && (
            <p className="text-sm text-gray-500">
              {lastUpdate}
            </p>
          )}
        </div>

        {statusItems && statusItems.length > 0 && (
          <div className="relative w-full">
            <div className="relative">
              <Marquee pauseOnHover className="[--duration:30s] [--gap:1rem]">
                {statusItems.map(({ key, config, value }) => (
                  <StatusCard
                    key={key}
                    label={config.label}
                    description={config.description}
                    value={value}
                    suffix={config.valueType === 'number' ? config.suffix : undefined}
                    onClick={onStatusClick}
                  />
                ))}
              </Marquee>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 