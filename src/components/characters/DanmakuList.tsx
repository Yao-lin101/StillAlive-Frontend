import { useMemo, useState } from 'react';
import { cn } from "@/lib/utils";
import { Message } from "@/types/character";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface DanmakuListProps {
    messages: Message[];
    className?: string;
}

const TRACK_HEIGHT = 32; // Height per track in pixels
const TRACK_COUNT = 4;   // Number of vertical tracks

const DanmakuItem = ({
    msg,
    trackIndex,
    onClick
}: {
    msg: Message;
    trackIndex: number;
    onClick: (msg: Message) => void;
}) => {
    const params = useMemo(() => {
        const duration = 15 + Math.random() * 10;
        const delay = Math.random() * 20;
        return { duration, delay };
    }, []);

    return (
        <div
            onClick={() => onClick(msg)}
            className={cn(
                "danmaku-item absolute flex items-center px-3 py-1.5 rounded-full",
                "bg-black/20 backdrop-blur-sm border border-white/10 shadow-sm",
                "text-white/90 text-sm font-medium whitespace-nowrap cursor-pointer pointer-events-auto",
                "hover:bg-black/60 hover:border-white/30 hover:scale-105 transition-all"
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
    const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

    if (!messages || messages.length === 0) {
        return <div className={cn("relative w-full overflow-hidden", className)} />;
    }

    return (
        <>
            <div
                className={cn(
                    "relative w-full overflow-hidden select-none pointer-events-none",
                    className
                )}
                style={{
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
            .danmaku-item:hover {
              animation-play-state: paused;
              z-index: 50;
            }
          `}
                </style>

                {messages.map((msg, index) => (
                    <DanmakuItem
                        key={msg.id}
                        msg={msg}
                        trackIndex={index % TRACK_COUNT}
                        onClick={setSelectedMsg}
                    />
                ))}
            </div>

            <Dialog open={!!selectedMsg} onOpenChange={(open) => !open && setSelectedMsg(null)}>
                <DialogContent className="sm:max-w-md bg-white/90 dark:bg-black/90 backdrop-blur-xl border-white/20">
                    <DialogHeader>
                        <DialogTitle>弹幕详情</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none text-gray-500">内容</h4>
                            <p className="text-lg font-medium dark:text-gray-100 break-words">{selectedMsg?.content}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t pt-4 dark:border-gray-800">
                            <div className="flex flex-col gap-1">
                                <span>发送时间</span>
                                <span className="font-mono text-xs opacity-70">
                                    {selectedMsg?.created_at && new Date(selectedMsg.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="font-medium text-xs text-gray-900 dark:text-gray-100">
                                        {selectedMsg?.location || '异世界'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
