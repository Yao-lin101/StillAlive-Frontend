import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { StatusConfigType } from '@/types/character';

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

export const CharacterDisplayPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [character, setCharacter] = useState<CharacterDisplay | null>(null);
  const [status, setStatus] = useState<CharacterStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-4">⚠️</h1>
          <p className="text-gray-300">{error || '角色不存在'}</p>
        </div>
      </div>
    );
  }

  const theme = character.status_config?.theme || {
    background_url: '',
    background_overlay: 'from-gray-900/95 to-gray-800/95',
    accent_color: 'from-blue-400 to-purple-400'
  };

  const getStatusColor = (status: 'online' | 'offline') => {
    return status === 'online' 
      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' 
      : 'bg-gray-500 shadow-lg shadow-gray-500/50';
  };

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
    <div className="relative min-h-screen text-white">
      {theme.background_url && (
        <div className="fixed inset-0 z-0">
          <img 
            src={theme.background_url} 
            alt="背景" 
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${theme.background_overlay}`} />
        </div>
      )}
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-12">
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.accent_color} rounded-lg blur opacity-25`}></div>
            <Card className="relative bg-gray-800/50 border-0 backdrop-blur-xl rounded-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6">
                    {character.avatar ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white/10"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 ring-4 ring-white/10 flex items-center justify-center">
                        <span className="text-5xl font-bold text-white/80">
                          {character.name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.accent_color}`}>
                        {character.name}
                      </h1>
                      {character.bio && (
                        <p className="mt-3 text-gray-300 max-w-xl whitespace-pre-wrap">
                          {character.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.status || 'offline')}`} />
                      <span className="text-sm text-gray-300">
                        {status?.status === 'online' ? '在线' : '离线'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {character.status_config?.vital_signs && Object.entries(character.status_config.vital_signs).length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r ${theme.accent_color}`}>
                  生命体征
                </h2>
                {status?.status_data?.vital_signs?.updated_at && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {formatTimeElapsed(status.status_data.vital_signs.updated_at)}
                    </p>
                    {character.status_config?.display && (
                      <p className="text-xs text-gray-500 mt-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(character.status_config.vital_signs).map(([key, config]) => {
                  const statusKey = config.key || key;
                  const statusValue = status?.status_data?.vital_signs?.data?.[statusKey];
                  
                  return (
                    <Card 
                      key={key} 
                      className="relative bg-gray-800/50 border-0 backdrop-blur-sm rounded-lg overflow-hidden group hover:bg-gray-800/70 transition-all duration-300"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${theme.accent_color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      <div className="relative p-6 space-y-2">
                        <h3 className="text-lg font-medium text-gray-200">{config.label}</h3>
                        {config.description && (
                          <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg px-3 py-2 -top-12 left-1/2 transform -translate-x-1/2 w-max max-w-[250px] z-10 shadow-xl">
                            {config.description}
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        )}
                        <div className="mt-2">
                          <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.accent_color}`}>
                            {statusValue !== undefined ? (
                              <>
                                {statusValue}
                                {config.valueType === 'number' && config.suffix ? (
                                  <span className="text-base ml-1 text-gray-400">{config.suffix}</span>
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
      </div>
    </div>
  );
}; 