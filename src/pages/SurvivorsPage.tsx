import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { SparklesText } from "@/components/magicui/sparkles-text";
import { motion } from "framer-motion";

interface Survivor {
    display_code: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    is_online: boolean;
    last_updated: string | null;
    status_message: string;
}

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
                className="group relative overflow-hidden cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate(`/d/${survivor.display_code}`)}
            >
                {/* 在线状态指示器 */}
                <div className="absolute top-3 right-3 z-10">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${survivor.is_online
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${survivor.is_online
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-gray-400'
                            }`} />
                        {survivor.is_online ? '在线' : '离线'}
                    </div>
                </div>

                {/* 渐变背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative p-6">
                    <div className="flex items-start gap-4">
                        {/* 头像 */}
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-200 dark:ring-purple-800 group-hover:ring-purple-400 transition-all duration-300">
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
                                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                                        {survivor.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {/* 在线呼吸动效 */}
                            {survivor.is_online && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
                                </div>
                            )}
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {survivor.name}
                            </h3>

                            {/* 状态消息 */}
                            <p className="mt-1 text-sm text-purple-600 dark:text-purple-400 font-medium">
                                {survivor.status_message || '未知状态'}
                            </p>

                            {/* 最后更新时间 */}
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>最后活动: {formatTimeElapsed(survivor.last_updated)}</span>
                            </div>
                        </div>

                        {/* 箭头指示器 */}
                        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export const SurvivorsPage: React.FC = () => {
    const [survivors, setSurvivors] = useState<Survivor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent" />
                    <p className="text-gray-500 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                    <h1 className="text-3xl font-bold mb-4">⚠️</h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <SparklesText
                                text="Survivors"
                                colors={{ first: "#A07CFE", second: "#FE8FB5" }}
                                className="text-3xl md:text-4xl font-bold"
                            />
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                探索所有存活者的实时状态
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                {survivors.filter(s => s.is_online).length} 人在线
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {survivors.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="text-6xl mb-4">👻</div>
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                暂无存活者
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                还没有任何角色被创建
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {survivors.map((survivor, index) => (
                                <SurvivorCard key={survivor.display_code} survivor={survivor} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
