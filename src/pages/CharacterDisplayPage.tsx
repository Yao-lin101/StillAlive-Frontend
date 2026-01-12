import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { StatusConfigType } from '@/types/character';
import { ShineBorder } from "@/components/magicui/shine-border";
import { motion, AnimatePresence } from "framer-motion";
import MusicPlayer from '../components/MusicPlayer';
import { Background } from '@/components/characters/components/display/Background';
import { StatusCard } from '@/components/characters/components/display/StatusCard';
import { CharacterCard } from '@/components/characters/components/display/CharacterCard';
import { CharacterMessages } from '@/components/characters/CharacterMessages';
import { DanmakuList } from '@/components/characters/DanmakuList';
import { AnimatedContent } from '@/components/characters/components/display/AnimatedContent';
import { Message } from '@/types/character';
import '@/styles/animations.css';

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

const Modal = ({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-2xl w-full"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <Card className="w-full overflow-hidden bg-white/90 backdrop-blur-sm">
              <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
              <div className="p-6">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                {children}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const CharacterDisplayPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [character, setCharacter] = useState<CharacterDisplay | null>(null);
  const [status, setStatus] = useState<CharacterStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [currentMusicUrl, setCurrentMusicUrl] = useState<string | null>(null);
  const [isCardHidden, setIsCardHidden] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = async () => {
    if (!code) return;
    try {
      const data = await characterService.getMessages(code);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  // 更新页面标题
  useEffect(() => {
    if (character?.name) {
      document.title = `${character.name}${getStatusMessage()}`;
      return () => {
        document.title = 'StillAlive'; // 组件卸载时恢复默认标题
      };
    }
  }, [character?.name]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [characterData, statusData, messagesData] = await Promise.all([
          characterService.getPublicDisplay(code!),
          characterService.getCharacterStatus(code!),
          characterService.getMessages(code!)
        ]);
        setCharacter(characterData);
        setStatus(statusData);
        setMessages(messagesData);

        // 初始化音乐
        if (characterData.status_config?.display) {
          updateMusicPlayer(characterData.status_config, statusData);
        }
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

        // 更新音乐播放器
        if (character?.status_config?.display) {
          updateMusicPlayer(character.status_config, statusData);
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    const intervalId = setInterval(fetchStatus, 15000);
    return () => clearInterval(intervalId);
  }, [code, character]);

  // 根据状态更新音乐播放器
  const updateMusicPlayer = (config: StatusConfigType, statusData: CharacterStatus | null) => {
    if (!statusData || !config.display) return;

    // 获取最新更新时间
    const latestUpdate = Object.values(statusData.status_data)
      .map(s => new Date(s.updated_at).getTime())
      .sort((a, b) => b - a)[0];

    if (!latestUpdate) {
      // 如果没有更新记录，使用默认音乐
      setCurrentMusicUrl(config.display.default_music_url || null);
      return;
    }

    // 计算距离最后更新的小时数
    const diffInHours = (new Date().getTime() - latestUpdate) / (1000 * 60 * 60);

    // 查找匹配的超时消息
    const timeoutMessage = config.display.timeout_messages
      ?.sort((a, b) => b.hours - a.hours)
      .find(msg => diffInHours >= msg.hours);

    // 设置音乐URL
    if (timeoutMessage?.music_link) {
      setCurrentMusicUrl(timeoutMessage.music_link);
    } else {
      setCurrentMusicUrl(config.display.default_music_url || null);
    }
  };

  const statusItems = character?.status_config && Object.entries(character.status_config)
    .filter(([key]) => key !== 'display' && key !== 'theme')
    .flatMap(([_, configs]) =>
      Object.entries(configs as Record<string, any>).map(([key, config]) => {
        const configKey = config.key || key;
        let latestValue: any;
        let latestUpdate: number | undefined;

        if (status?.status_data) {
          Object.entries(status.status_data).forEach(([_, typeData]) => {
            if (typeData.data && configKey in typeData.data) {
              const updateTime = new Date(typeData.updated_at).getTime();
              if (!latestUpdate || updateTime > latestUpdate) {
                latestValue = typeData.data[configKey];
                latestUpdate = updateTime;
              }
            }
          });
        }

        return {
          key,
          config,
          value: latestValue,
          updatedAt: latestUpdate
        };
      })
    )
    .sort((a, b) => {
      if (!a.updatedAt || !b.updatedAt) return 0;
      return b.updatedAt - a.updatedAt;
    });

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

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小时前`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}天前`;
  };

  const getStatusMessage = () => {
    if (!status || !character.status_config?.display) return '';

    const latestUpdate = Object.values(status.status_data)
      .map(s => new Date(s.updated_at).getTime())
      .sort((a, b) => b - a)[0];

    if (!latestUpdate) return '';

    const diffInHours = (new Date().getTime() - latestUpdate) / (1000 * 60 * 60);

    const timeoutMessage = character.status_config?.display?.timeout_messages
      ?.sort((a, b) => b.hours - a.hours)
      .find(msg => diffInHours >= msg.hours);

    return timeoutMessage?.message || character.status_config?.display?.default_message || '';
  };

  const getLastUpdate = () => {
    if (!status || Object.values(status.status_data).length === 0) return '';

    return formatTimeElapsed(
      Object.values(status.status_data)
        .map(s => s.updated_at)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      onClick={() => {
        if (isCardHidden) {
          setIsCardHidden(false);
          setIsMusicPlaying(true);
        }
      }}
    >
      <Background
        theme={character.status_config?.theme}
        onBgImageError={() => { }}
      />

      <AnimatedContent
        isHidden={isCardHidden}
        onShow={() => { }}
        className="relative z-20 w-full min-h-full flex flex-col items-center py-12"
      >
        <div className="w-full max-w-md md:max-w-2xl flex flex-col gap-6 px-4 my-auto">
          <DanmakuList messages={messages} className="h-32 mb-2" />
          <CharacterCard
            name={character.name}
            avatar={character.avatar}
            bio={character.bio}
            statusMessage={getStatusMessage()}
            lastUpdate={getLastUpdate()}
            statusItems={statusItems}
            onStatusClick={() => setShowStatusDialog(true)}
            onHideClick={(e) => {
              e.stopPropagation();
              setIsCardHidden(true);
            }}
            isMusicPlaying={isMusicPlaying}
            onMusicToggle={currentMusicUrl ? () => setIsMusicPlaying(!isMusicPlaying) : undefined}
          />
          <CharacterMessages
            displayCode={code!}
            onMessageSent={fetchMessages}
            className="mt-4"
          />
        </div>
      </AnimatedContent>

      {/* 音乐播放器 - 固定在底部 */}
      {currentMusicUrl && (
        <MusicPlayer
          musicUrl={currentMusicUrl}
          isPlaying={isMusicPlaying}
          onPlayingChange={setIsMusicPlaying}
        />
      )}

      <Modal
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">状态信息</h2>
        </div>
        <div className="h-[55vh] overflow-y-auto pr-2 -mr-2">
          <div className="grid grid-cols-2 gap-4">
            {statusItems?.map(({ key, config, value, updatedAt }) => (
              <StatusCard
                key={key}
                variant="compact"
                label={config.label}
                description={config.description}
                value={value}
                suffix={config.valueType === 'number' ? config.suffix : undefined}
                timestamp={updatedAt ? formatTimeElapsed(new Date(updatedAt).toISOString()) : undefined}
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}; 