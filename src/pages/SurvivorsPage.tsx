import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { SparklesText } from "@/components/magicui/sparkles-text";
import { motion } from "framer-motion";
import { LevelBadge } from "@/components/characters/LevelBadge";

interface Survivor {
    display_code: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    is_online: boolean;
    last_updated: string | null;
    status_message: string;
    experience?: number;
}

/** 判断角色是否为"最近活跃"：在线 或 最后更新在24小时内 */
const isRecentlyActive = (survivor: Survivor): boolean => {
    if (survivor.is_online) return true;
    if (!survivor.last_updated) return false;
    const diffMs = Date.now() - new Date(survivor.last_updated).getTime();
    return diffMs < 24 * 60 * 60 * 1000; // 24h
};

const SurvivorCard: React.FC<{ survivor: Survivor; index: number }> = ({ survivor, index }) => {
    const navigate = useNavigate();

    const formatTimeElapsed = (timestamp: string | null) => {
        if (!timestamp) return '未知';
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Card
                className="group relative overflow-hidden cursor-pointer backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-300 rounded-2xl"
                onClick={() => navigate(`/d/${survivor.display_code}`)}
            >
                {/* 在线状态指示器 */}
                <div className="absolute top-3 right-3 z-10">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-white/20 shadow-sm ${survivor.is_online
                        ? 'bg-green-100/80 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-gray-100/80 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${survivor.is_online
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-gray-400'
                            }`} />
                        {survivor.is_online ? '在线' : '离线'}
                    </div>
                </div>

                {/* 渐变背景装饰 */}
                {/* 渐变背景装饰 - 更新为更柔和的玻璃光泽 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative p-6">
                    <div className="flex items-start gap-4">
                        {/* 头像 */}
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/30 dark:ring-white/10 group-hover:ring-[#90D5FF] dark:group-hover:ring-[#90D5FF] transition-all duration-300 shadow-lg">
                                {survivor.avatar ? (
                                    <img
                                        src={survivor.avatar}
                                        alt={survivor.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${survivor.name}`;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#FFB5B5] to-[#90D5FF] flex items-center justify-center text-white text-2xl font-bold">
                                        {survivor.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* 等级标志 - 头像下方内切 */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
                                <LevelBadge experience={survivor.experience} className="scale-[0.8] shadow-md border border-white/20" />
                            </div>
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate group-hover:text-[#90D5FF] dark:group-hover:text-[#90D5FF] transition-colors">
                                {survivor.name}
                            </h3>

                            {/* 状态消息 */}
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium group-hover:text-[#FFB5B5] transition-colors">
                                {survivor.status_message || '未知状态'}
                            </p>

                            {/* 最后更新时间 */}
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>最后活动: {formatTimeElapsed(survivor.last_updated)}</span>
                            </div>
                        </div>

                        {/* 箭头指示器 */}
                        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-5 h-5 text-[#90D5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Card >
        </motion.div >
    );
};

/** 空状态提示 */
const EmptyState: React.FC<{ emoji: string; title: string; description: string }> = ({ emoji, title, description }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
    >
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </motion.div>
);

/** 卡片网格 */
const SurvivorGrid: React.FC<{ survivors: Survivor[] }> = ({ survivors }) => (
    <motion.div
        key={survivors.map(s => s.display_code).join(',')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
        {survivors.map((survivor, index) => (
            <SurvivorCard key={survivor.display_code} survivor={survivor} index={index} />
        ))}
    </motion.div>
);

export const SurvivorsPage: React.FC = () => {
    const [survivors, setSurvivors] = useState<Survivor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 分类：活跃 / 不活跃
    const { active, inactive } = useMemo(() => {
        const active: Survivor[] = [];
        const inactive: Survivor[] = [];
        for (const s of survivors) {
            (isRecentlyActive(s) ? active : inactive).push(s);
        }
        return { active, inactive };
    }, [survivors]);

    // 首次加载
    useEffect(() => {
        const fetchSurvivors = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await characterService.getSurvivors();
                setSurvivors(data.results);
            } catch (err) {
                setError(formatError(err));
            } finally {
                setIsLoading(false);
            }
        };

        fetchSurvivors();
    }, []);

    // 静默刷新（不显示加载状态）
    useEffect(() => {
        const silentRefresh = async () => {
            try {
                const data = await characterService.getSurvivors();
                setSurvivors(data.results);
            } catch (err) {
                // 静默刷新时忽略错误，保持当前数据
                console.error('Silent refresh failed:', err);
            }
        };

        // 每30秒静默刷新一次
        const intervalId = setInterval(silentRefresh, 30000);
        return () => clearInterval(intervalId);
    }, []);

    // 页面整体容器样式 (Glassmorphism 背景 - 这里的类名仅用于内容区的布局，背景由外部div处理)
    const pageBgClass = "relative w-full z-10";
    // 头部样式
    const headerClass = "sticky top-0 z-50 backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]";

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#90D5FF] border-t-transparent" />
                    <p className="text-gray-500 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                    <h1 className="text-3xl font-bold mb-4">⚠️</h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* 固定背景 */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#FFE1E1] to-[#E3F4FF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

            <div className={pageBgClass}>
                {/* Header */}
                <div className={headerClass}>
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <SparklesText
                                    text="Pokemon Gettodaze"
                                    colors={{ first: "#90D5FF", second: "#FFB5B5" }}
                                    className="text-3xl md:text-4xl font-bold"
                                />
                                <p className="mt-2 text-slate-600 dark:text-gray-400">
                                    都还活着没？
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-full shadow-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {survivors.filter(s => s.is_online).length} 人在线
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {survivors.length === 0 ? (
                        <EmptyState emoji="👻" title="暂无存活者" description="还没有任何角色被创建" />
                    ) : (
                        <Tabs defaultValue="active" className="w-full">
                            <TabsList className="mb-6 backdrop-blur-md bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-white/10 p-1 rounded-xl shadow-sm">
                                <TabsTrigger value="active" className="gap-2 rounded-lg px-4 py-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    冒泡
                                    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-400">
                                        {active.length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="inactive" className="gap-2 rounded-lg px-4 py-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    潜水
                                    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-400">
                                        {inactive.length}
                                    </span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="active">
                                {active.length === 0 ? (
                                    <EmptyState emoji="😴" title="暂无活跃角色" description="最近24小时内没有角色活动" />
                                ) : (
                                    <SurvivorGrid survivors={active} />
                                )}
                            </TabsContent>

                            <TabsContent value="inactive">
                                {inactive.length === 0 ? (
                                    <EmptyState emoji="🎉" title="全员活跃！" description="所有角色都在最近24小时内有过活动" />
                                ) : (
                                    <SurvivorGrid survivors={inactive} />
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
};
