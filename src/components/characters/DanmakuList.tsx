import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Message } from "@/types/character";

interface DanmakuListProps {
    messages: Message[];
    className?: string;
}

const TRACK_HEIGHT = 32; // Height per track in pixels
const TRACK_COUNT = 4;   // Number of vertical tracks

const DanmakuItem = ({
    msg,
    trackIndex,
}: {
    msg: Message;
    trackIndex: number;
}) => {
    // Generate random animation parameters once per item
    const params = useMemo(() => {
        // Duration between 15s (fast) and 25s (slow)
        const duration = 15 + Math.random() * 10;
        // Initial delay between 0s and 20s to scatter messages
        const delay = Math.random() * 20;

        return { duration, delay };
    }, []);

    return (
        <div
            className={cn(
                "danmaku-item absolute flex items-center px-3 py-1.5 rounded-full",
                "bg-black/20 backdrop-blur-sm border border-white/10 shadow-sm",
                "text-white/90 text-sm font-medium whitespace-nowrap cursor-default",
                "hover:bg-black/60 hover:border-white/30 hover:z-10 transition-colors"
            )}
            style={{
                top: `${trackIndex * TRACK_HEIGHT}px`,
                left: '100%',
                willChange: 'transform, left',
                animationName: 'danmaku-scroll',
                animationDuration: `${params.duration}s`,
                animationTimingFunction: 'linear',
                animationDelay: `${params.delay}s`,
                animationIterationCount: 'infinite',
            }}
        >
            {msg.content}
        </div>
    );
};

export function DanmakuList({ messages, className }: DanmakuListProps) {
    // If no messages, render empty container
    if (!messages || messages.length === 0) {
        return <div className={cn("relative w-full overflow-hidden", className)} />;
    }

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden select-none",
                className
            )}
            style={{
                // CSS Mask for fade effect on left and right edges
                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
        >
            <style>
                {`
          @keyframes danmaku-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(calc(-100vw - 100%)); } 
          }
          /* Pause animation on hover */
          .danmaku-item:hover {
            animation-play-state: paused;
          }
        `}
            </style>

            {messages.map((msg, index) => (
                <DanmakuItem
                    key={msg.id}
                    msg={msg}
                    trackIndex={index % TRACK_COUNT}
                />
            ))}
        </div>
    );
}
