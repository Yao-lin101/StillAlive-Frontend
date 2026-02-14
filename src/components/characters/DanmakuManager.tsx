import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Message } from "@/types/character";
import { Button } from "@/components/ui/button";

interface DanmakuManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    messages: Message[];
    onDelete: (id: number) => void;
}

export function DanmakuManager({ open, onOpenChange, messages, onDelete }: DanmakuManagerProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col bg-white/90 backdrop-blur-xl border-white/20">
                <DialogHeader>
                    <DialogTitle>弹幕管理</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 mt-4 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">暂无弹幕</div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="flex justify-between items-start gap-4 p-3 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors">
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-medium text-gray-900 break-words">{msg.content}</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                                        <span>{new Date(msg.created_at).toLocaleString()}</span>
                                        <span>{msg.location || '未知'} ({msg.ip_address})</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 h-8 px-2"
                                    onClick={() => onDelete(msg.id)}
                                >
                                    删除
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
