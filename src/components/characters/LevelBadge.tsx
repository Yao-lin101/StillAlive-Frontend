import React from 'react';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
    experience?: number;
    className?: string;
}

// 等级系统：根据经验值返回等级和对应颜色
// 等级 6 (渐变): > 2^16 (65536)
// 等级 5 (红色): > 2^15 (32768)
// 等级 4 (橙色): > 2^13 (8192)
// 等级 3 (蓝色): > 2^10 (1024)
// 等级 2 (绿色): > 2^6 (64)
// 等级 1 (白色): > 2^1 (2)
// 等级 0 (白色): >= 0
const getLevelInfo = (experience: number = 0): { level: number; colorClass: string } => {
    if (experience > 65536) return { level: 6, colorClass: 'bg-gradient-to-r from-[#FFB5B5] to-[#90D5FF] text-white' };
    if (experience > 32768) return { level: 5, colorClass: 'bg-red-500 text-white' };
    if (experience > 8192) return { level: 4, colorClass: 'bg-orange-500 text-white' };
    if (experience > 1024) return { level: 3, colorClass: 'bg-blue-500 text-white' };
    if (experience > 64) return { level: 2, colorClass: 'bg-green-500 text-white' };
    if (experience > 2) return { level: 1, colorClass: 'bg-white/80 text-gray-700 border border-gray-200' };
    return { level: 0, colorClass: 'bg-white/80 text-gray-700 border border-gray-200' };
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({ experience = 0, className }) => {
    const { level, colorClass } = getLevelInfo(experience);

    return (
        <span className={cn(
            'flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded shadow-sm scale-[0.7] origin-left',
            colorClass,
            className
        )}>
            Lv.{level}
        </span>
    );
};

export { getLevelInfo };
