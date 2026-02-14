import React, { useState } from 'react';
import { characterService } from '@/services/characterService';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/character';

import { toast } from 'sonner';

interface CharacterMessagesProps {
    displayCode: string;
    onMessageSent: (msg?: Message) => void;
    className?: string;
}

export const CharacterMessages: React.FC<CharacterMessagesProps> = ({ displayCode, onMessageSent, className }) => {
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            const msg = await characterService.sendMessage(displayCode, newMessage);
            setNewMessage('');
            onMessageSent(msg);
            toast.success('弹幕发送成功');
        } catch (error) {
            toast.error('发送失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full max-w-2xl mx-auto ${className || ''}`}>
            <div className="flex items-center gap-2 bg-white/60 p-2 rounded-full backdrop-blur-md shadow-lg border border-white/20 opacity-70 hover:opacity-100 focus-within:opacity-100 transition-all duration-300">
                <input
                    value={newMessage}
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                    placeholder="发送弹幕..."
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
                    maxLength={200}
                    className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-gray-900 placeholder:text-gray-500/70 h-9 min-w-0"
                />
                <Button
                    onClick={handleSend}
                    disabled={loading || !newMessage.trim()}
                    size="sm"
                    className="rounded-full px-6"
                >
                    {loading ? '...' : '发送'}
                </Button>
            </div>
        </div>
    );
};
