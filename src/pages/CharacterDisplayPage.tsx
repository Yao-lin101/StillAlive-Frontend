import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { StatusConfigType } from '@/types/character';
import { Meteors } from "@/components/magicui/meteors";

interface CharacterDisplay {
  name: string;
  avatar: string | null;
  bio: string | null;
  status_config?: StatusConfigType;
}

interface CharacterStatus {
  status: 'online' | 'offline';
  last_updated: string | null;
  status_data: {
    [key: string]: {
      data: any;
      updated_at: string;
    };
  };
}

interface DominantColor {
  r: number;
  g: number;
  b: number;
}

export const CharacterDisplayPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [character, setCharacter] = useState<CharacterDisplay | null>(null);
  const [status, setStatus] = useState<CharacterStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bgImageError, setBgImageError] = useState(false);
  const [dominantColor, setDominantColor] = useState<DominantColor | null>(null);

  const getDominantColor = useCallback((imageUrl: string): Promise<DominantColor> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorCounts: { [key: string]: number } = {};
        
        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const rgb = `${r},${g},${b}`;
          colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
        }

        let maxCount = 0;
        let dominantRGB = '0,0,0';
        
        Object.entries(colorCounts).forEach(([rgb, count]) => {
          if (count > maxCount) {
            maxCount = count;
            dominantRGB = rgb;
          }
        });

        const [r, g, b] = dominantRGB.split(',').map(Number);
        resolve({ r, g, b });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [characterData, statusData] = await Promise.all([
          characterService.getPublicDisplay(code!),
          characterService.getCharacterStatus(code!)
        ]);
        setCharacter(characterData);
        setStatus(statusData);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (code) {
      fetchData();
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;

    const fetchStatus = async () => {
      try {
        const statusData = await characterService.getCharacterStatus(code);
        setStatus(statusData);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    const intervalId = setInterval(fetchStatus, 15000);
    return () => clearInterval(intervalId);
  }, [code]);

  useEffect(() => {
    if (character?.status_config?.theme?.background_url && !bgImageError) {
      getDominantColor(character.status_config.theme.background_url)
        .then((color) => {
          console.log('提取的主题色:', `rgb(${color.r}, ${color.g}, ${color.b})`);
          console.log('渐变背景:', `linear-gradient(to bottom, rgba(${color.r},${color.g},${color.b},0.8), rgba(0,0,0,1))`);
          setDominantColor(color);
        })
        .catch(console.error);
    }
  }, [character?.status_config?.theme?.background_url, bgImageError, getDominantColor]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-4">⚠️</h1>
          <p className="text-gray-600">{error || '角色不存在'}</p>
        </div>
      </div>
    );
  }

  const formatTimeElapsed = (timestamp: string) => {
    const lastUpdate = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚更新';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前更新`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小时前更新`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}天前更新`;
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100vh;
          width: 100vw;
          background-color: #000;
        }
      `}</style>
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{
          background: dominantColor 
            ? `linear-gradient(to bottom, 
                rgba(${dominantColor.r},${dominantColor.g},${dominantColor.b},0.8),
                rgba(0,0,0,1))`
            : '#000'
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {character.status_config?.theme?.background_url && !bgImageError && (
            <img 
              src={character.status_config.theme.background_url} 
              alt="背景" 
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              onError={() => {
                console.warn('Background image failed to load:', character.status_config?.theme?.background_url);
                setBgImageError(true);
              }}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Meteors 
              number={30}
              className="text-white"
            />
          </div>
        </div>
        
        <Card className="relative max-w-2xl w-full mx-4 bg-white/80 backdrop-blur-sm">
          <div className="p-8">
            <div className="flex items-center space-x-6 mb-8">
              {character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-white/50"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white/50">
                  <span className="text-4xl font-bold text-gray-400">
                    {character.name[0]}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {character.name}
                </h1>
                {character.bio && (
                  <p className="mt-2 text-gray-600">
                    {character.bio}
                  </p>
                )}
              </div>
            </div>

            {character.status_config?.vital_signs && Object.entries(character.status_config.vital_signs).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    生命体征
                  </h2>
                  {status?.status_data?.vital_signs?.updated_at && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatTimeElapsed(status.status_data.vital_signs.updated_at)}
                      </p>
                      {character.status_config?.display && (
                        <p className="text-sm text-gray-500 mt-1">
                          {(() => {
                            if (!status?.status_data?.vital_signs?.updated_at) return '';
                            
                            const lastUpdate = new Date(status.status_data.vital_signs.updated_at);
                            const now = new Date();
                            const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
                            
                            const timeoutMessage = character.status_config?.display?.timeout_messages
                              ?.sort((a, b) => b.hours - a.hours)
                              .find(msg => diffInHours >= msg.hours);
                            
                            return timeoutMessage?.message || character.status_config?.display?.default_message || '';
                          })()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(character.status_config.vital_signs).map(([key, config]) => {
                    const statusKey = config.key || key;
                    const statusValue = status?.status_data?.vital_signs?.data?.[statusKey];
                    
                    return (
                      <Card key={key} className="bg-white/50">
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-gray-900">{config.label}</h3>
                          {config.description && (
                            <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                          )}
                          <div className="mt-2">
                            <span className="text-xl font-semibold text-gray-900">
                              {statusValue !== undefined ? (
                                <>
                                  {statusValue}
                                  {config.valueType === 'number' && config.suffix ? (
                                    <span className="text-sm ml-1 text-gray-500">{config.suffix}</span>
                                  ) : null}
                                </>
                              ) : (
                                '--'
                              )}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}; 