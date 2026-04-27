import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { StatusConfigType } from '@/types/character';
import { motion, AnimatePresence } from "framer-motion";
import MusicPlayer from '../components/MusicPlayer';
import { Background } from '@/components/characters/components/display/Background';
import { StatusCard } from '@/components/characters/components/display/StatusCard';
import { CharacterCard } from '@/components/characters/components/display/CharacterCard';
import { CharacterMessages } from '@/components/characters/CharacterMessages';
import { DanmakuList } from '@/components/characters/DanmakuList';
import { AnimatedContent } from '@/components/characters/components/display/AnimatedContent';
import { Message } from '@/types/character';
import { toast } from 'sonner';
import { DanmakuManager } from '@/components/characters/DanmakuManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { DailyReportCalendar } from '@/components/characters/components/display/DailyReportCalendar';
import { DailyReportDetail } from '@/components/characters/components/display/DailyReportDetail';
import { DailyReportDetail as DailyReportDetailType } from '@/types/character';
import { MorphingText } from "@/components/magicui/morphing-text";
import '@/styles/animations.css';

interface CharacterDisplay {
  uid?: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  status_config?: StatusConfigType;
  is_owner?: boolean;
  experience?: number;
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
            <Card className="w-full overflow-hidden bg-white">
              <div className="p-6 pt-12">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
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
  const [showDanmakuManager, setShowDanmakuManager] = useState(false);
  const [selectedDanmaku, setSelectedDanmaku] = useState<Message | null>(null);
  const [isBgLoaded, setIsBgLoaded] = useState(false);

  const [reportDates, setReportDates] = useState<number[]>([]);
  const [currentReportYear, setCurrentReportYear] = useState(new Date().getFullYear());
  const [currentReportMonth, setCurrentReportMonth] = useState(new Date().getMonth());
  const [selectedReportDate, setSelectedReportDate] = useState<Date | null>(null);
  const [selectedReport, setSelectedReport] = useState<DailyReportDetailType | null>(null);
  const [isLoadingReportDates, setIsLoadingReportDates] = useState(false);
  const [isLoadingReportDetail, setIsLoadingReportDetail] = useState(false);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [isCheckingReport, setIsCheckingReport] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('status');
  const [dailyReportConfig, setDailyReportConfig] = useState<{
    is_enabled: boolean;
    is_visible: boolean;
    visibility?: string;
    is_owner?: boolean;
  } | null>(null);

  const fetchMessages = async () => {
    if (!code) return;
    try {
      const data = await characterService.getMessages(code);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    try {
      if (!code) return;
      await characterService.deleteMessage(code, msgId);
      toast.success('删除成功');
      fetchMessages();
    } catch (error) {
      toast.error('删除失败');
      console.error(error);
    }
  };

  const fetchReportDates = async (year?: number, month?: number): Promise<number[]> => {
    if (!code) return [];
    try {
      setIsLoadingReportDates(true);
      const targetYear = year ?? currentReportYear;
      const targetMonth = month ?? currentReportMonth;
      const dates = await characterService.getDailyReportDates(
        code,
        targetYear,
        targetMonth + 1
      );
      setReportDates(dates);
      return dates;
    } catch (error) {
      console.error('Failed to fetch report dates:', error);
      setReportDates([]);
      return [];
    } finally {
      setIsLoadingReportDates(false);
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (value === 'report') {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      setShowReportDetail(false);
      setSelectedReport(null);
      setSelectedReportDate(null);
      setIsCheckingReport(true);
      
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      try {
        const dates = await fetchReportDates(currentYear, currentMonth);
        
        const todayDate = today.getDate();
        const yesterdayDate = yesterday.getDate();
        const yesterdayYear = yesterday.getFullYear();
        const yesterdayMonth = yesterday.getMonth();
        
        if (dates.includes(todayDate)) {
          await handleReportDateSelect(today);
          return;
        }
        
        if (yesterdayYear === currentYear && yesterdayMonth === currentMonth) {
          if (dates.includes(yesterdayDate)) {
            await handleReportDateSelect(yesterday);
            return;
          }
        } else {
          const prevMonthDates = await fetchReportDates(yesterdayYear, yesterdayMonth);
          if (prevMonthDates.includes(yesterdayDate)) {
            setCurrentReportYear(yesterdayYear);
            setCurrentReportMonth(yesterdayMonth);
            await handleReportDateSelect(yesterday);
            return;
          }
        }
        
        setCurrentReportYear(currentYear);
        setCurrentReportMonth(currentMonth);
      } finally {
        setIsCheckingReport(false);
      }
    }
  };

  const handleReportDateSelect = async (date: Date) => {
    setSelectedReportDate(date);
    
    if (!code) return;
    
    try {
      setIsLoadingReportDetail(true);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const report = await characterService.getDailyReportDetail(code, dateStr);
      setSelectedReport(report);
      setShowReportDetail(true);
    } catch (error) {
      console.error('Failed to fetch report detail:', error);
      toast.error('获取日报详情失败');
    } finally {
      setIsLoadingReportDetail(false);
    }
  };

  const handleToggleReportHidden = async () => {
    if (!code || !selectedReport || !character?.is_owner) return;
    
    try {
      const dateStr = selectedReport.date;
      const result = await characterService.toggleDailyReportHidden(
        character.uid || code,
        dateStr,
        !selectedReport.is_hidden
      );
      setSelectedReport({
        ...selectedReport,
        is_hidden: result.is_hidden
      });
      toast.success(result.is_hidden ? '日报已隐藏' : '日报已显示');
    } catch (error) {
      console.error('Failed to toggle report hidden:', error);
      toast.error('操作失败');
    }
  };

  const handleDeleteReport = async () => {
    if (!code || !selectedReport || !character?.is_owner) return;
    
    try {
      const dateStr = selectedReport.date;
      await characterService.deleteDailyReport(
        character.uid || code,
        dateStr
      );
      setShowReportDetail(false);
      setSelectedReport(null);
      setSelectedReportDate(null);
      await fetchReportDates();
      toast.success('日报已删除');
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('删除失败');
    }
  };

  const handleMonthChange = (year: number, month: number) => {
    setCurrentReportYear(year);
    setCurrentReportMonth(month);
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
        const [characterData, statusData, messagesData, reportConfigData] = await Promise.all([
          characterService.getPublicDisplay(code!),
          characterService.getCharacterStatus(code!),
          characterService.getMessages(code!),
          characterService.getDailyReportConfigPublic(code!)
        ]);
        setCharacter(characterData);
        setStatus(statusData);
        setMessages(messagesData);
        setDailyReportConfig(reportConfigData);

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

        if (character?.status_config?.display) {
          updateMusicPlayer(character!.status_config, statusData);
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    const intervalId = setInterval(fetchStatus, 15000);
    return () => clearInterval(intervalId);
  }, [code, character]);

  useEffect(() => {
    if (showStatusDialog) {
      setActiveTab('status');
      setShowReportDetail(false);
      setSelectedReport(null);
      setSelectedReportDate(null);
    }
  }, [showStatusDialog]);

  useEffect(() => {
    if (activeTab === 'report' && !showReportDetail) {
      fetchReportDates();
    }
  }, [activeTab, currentReportYear, currentReportMonth]);

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

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-4">⚠️</h1>
          <p className="text-gray-400">{error || '角色不存在'}</p>
        </div>
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const isPageLoading = isLoading || !character || !isBgLoaded;
  const showLoadingOverlay = !isMobile && isPageLoading;

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
    if (!status || !character?.status_config?.display) return '';

    const latestUpdate = Object.values(status.status_data)
      .map(s => new Date(s.updated_at).getTime())
      .sort((a, b) => b - a)[0];

    if (!latestUpdate) return '';

    const diffInHours = (new Date().getTime() - latestUpdate) / (1000 * 60 * 60);

    const timeoutMessage = character?.status_config?.display?.timeout_messages
      ?.sort((a, b) => b.hours - a.hours)
      .find(msg => diffInHours >= msg.hours);

    return timeoutMessage?.message || character?.status_config?.display?.default_message || '';
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
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden light-mode-forced bg-black">
      {/* Mobile Simple Loading Overlay */}
      {isMobile && isPageLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
            <p className="text-white/60 font-mono text-sm animate-pulse">Loading System...</p>
          </div>
        </div>
      )}

      {/* Cinematic Minimal Loading Overlay */}
      <AnimatePresence>
        {showLoadingOverlay && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#050505] transform-gpu will-change-[opacity]"
          >
            <MorphingText texts={[
              "Initializing System",
              "Fetching Memory",
              "Establishing Connection",
              "Almost There"
            ]} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {character && (
        <React.Fragment>
          <Background
            theme={character.status_config?.theme}
            onBgImageError={() => { }}
            onInitialLoad={() => setIsBgLoaded(true)}
          />

          {/* 弹幕始终显示，不受隐藏卡片影响 */}
          <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
            <DanmakuList
              messages={messages}
              className="h-full"
              onSelect={setSelectedDanmaku}
            />
          </div>

          <div className={`absolute inset-0 ${isCardHidden ? 'z-0' : 'z-20'}`}>
            <AnimatedContent
              isHidden={isCardHidden}
              onShow={() => {
                setIsCardHidden(false);
                setIsMusicPlaying(true);
              }}
              className="w-full min-h-full flex flex-col items-center py-12"
            >
              <div className="w-full max-w-md md:max-w-2xl flex flex-col gap-6 px-4 my-auto relative z-20">
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
                  isOwner={character.is_owner}
                  onManageDanmaku={() => setShowDanmakuManager(true)}
                  experience={character.experience}
                />
                <CharacterMessages
                  displayCode={code!}
                  onMessageSent={(newMsg) => {
                    if (newMsg) {
                      setMessages(prev => [...prev, newMsg]);
                    } else {
                      fetchMessages();
                    }
                  }}
                  className="mt-4"
                />
              </div>
            </AnimatedContent>
          </div>

          {/* 音乐播放器 - 固定在底部 */}
          {currentMusicUrl && (
            <MusicPlayer
              musicUrl={currentMusicUrl}
              isPlaying={isMusicPlaying}
              onPlayingChange={setIsMusicPlaying}
            />
          )}

          {/* 状态详情弹窗 */}
          <Modal
            isOpen={showStatusDialog}
            onClose={() => {
              setShowStatusDialog(false);
              setShowReportDetail(false);
            }}
          >
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className={`grid w-full ${dailyReportConfig?.is_visible ? 'grid-cols-2' : 'grid-cols-1'} mb-4 !bg-gray-100`}>
                <TabsTrigger 
                  value="status"
                  className="!text-gray-600 
                    data-[state=active]:!bg-white 
                    data-[state=active]:!text-slate-800
                    data-[state=active]:!shadow-none
                    data-[state=active]:!from-transparent
                    data-[state=active]:!to-transparent"
                >
                  状态信息
                </TabsTrigger>
                {dailyReportConfig?.is_visible && (
                  <TabsTrigger 
                    value="report"
                    className="!text-gray-600 
                      data-[state=active]:!bg-white 
                      data-[state=active]:!text-slate-800
                      data-[state=active]:!shadow-none
                      data-[state=active]:!from-transparent
                      data-[state=active]:!to-transparent"
                  >
                    日报分析
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="status" className="mt-2">
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
              </TabsContent>

              {dailyReportConfig?.is_visible && (
                <TabsContent value="report" className="mt-2">
                  <div className={`${showReportDetail ? 'h-[55vh] flex flex-col' : 'h-[55vh] overflow-y-auto pr-2 -mr-2'}`}>
                    {showReportDetail ? (
                      <div className="flex-1 min-h-0">
                        <DailyReportDetail
                          report={selectedReport}
                          isLoading={isLoadingReportDetail}
                          isOwner={character?.is_owner || false}
                          onHide={handleToggleReportHidden}
                          onDelete={handleDeleteReport}
                          onBack={() => {
                            setShowReportDetail(false);
                            setSelectedReport(null);
                            setSelectedReportDate(null);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="pt-1">
                        {isCheckingReport || isLoadingReportDates ? (
                          <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                          </div>
                        ) : (
                          <DailyReportCalendar
                            reportDates={reportDates}
                            selectedDate={selectedReportDate}
                            onDateSelect={handleReportDateSelect}
                            currentYear={currentReportYear}
                            currentMonth={currentReportMonth}
                            onMonthChange={handleMonthChange}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </Modal>

          {/* 弹幕管理弹窗 */}
          <DanmakuManager
            open={showDanmakuManager}
            onOpenChange={setShowDanmakuManager}
            messages={messages}
            onDelete={handleDeleteMessage}
          />

          {/* 弹幕内容详情弹窗 */}
          <Dialog open={!!selectedDanmaku} onOpenChange={(open) => !open && setSelectedDanmaku(null)}>
            <DialogContent
              className="sm:max-w-md bg-white/90 backdrop-blur-xl border-white/20"
              onClick={(e) => e.stopPropagation()}
              onPointerDownOutside={(e) => e.stopPropagation()}
            >
              <DialogHeader>
                <DialogTitle>弹幕详情</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <p className="text-lg font-medium break-words">{selectedDanmaku?.content}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs opacity-70">
                      {selectedDanmaku?.created_at && new Date(selectedDanmaku.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-xs text-gray-900">
                        {selectedDanmaku?.location ? `${selectedDanmaku.location}网友` : '异世界网友'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </React.Fragment>
      )}
    </div>
  );
}; 