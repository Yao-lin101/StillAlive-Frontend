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
        console.log('Character Data:', characterData);
        console.log('Status Data:', statusData);
        console.log('Status Config:', characterData.status_config);
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

  // 定期刷新状态
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

    const intervalId = setInterval(fetchStatus, 15000); // 每15秒刷新一次

    return () => clearInterval(intervalId);
  }, [code]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 p-4">
          {error || '角色不存在'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 bg-white shadow-xl rounded-lg">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {character.avatar ? (
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-3xl text-gray-500">
                      {character.name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{character.name}</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-block w-2 h-2 rounded-full ${status?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-500">
                  {status?.status === 'online' ? '在线' : '离线'}
                </span>
              </div>
            </div>

            {character.bio && (
              <div>
                <h2 className="text-lg font-medium text-gray-700 mb-2">简介</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{character.bio}</p>
              </div>
            )}

            {character.status_config?.vital_signs && Object.entries(character.status_config.vital_signs).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-700">状态信息</h2>
                  {status?.status_data?.vital_signs?.updated_at && (
                    <p className="text-xs text-gray-400">
                      更新于 {new Date(status.status_data.vital_signs.updated_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(character.status_config.vital_signs).map(([key, config]) => {
                    const statusValue = status?.status_data?.vital_signs?.data?.[config.key];
                    
                    return (
                      <Card 
                        key={key} 
                        className="p-4 relative group cursor-help"
                      >
                        <div className="space-y-1">
                          <div>
                            <h3 className="text-sm font-medium">{config.label}</h3>
                          </div>
                          {config.description && (
                            <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 w-max max-w-[200px] z-10">
                              {config.description}
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                            </div>
                          )}
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">
                              {statusValue !== undefined ? (
                                <>
                                  {statusValue}
                                  {config.valueType === 'number' && config.suffix ? ` ${config.suffix}` : ''}
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
    </div>
  );
}; 