import React, { useState, useEffect } from 'react';
import { Message } from '@/types/character';
import { characterService } from '@/services/characterService';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';

interface CharacterMessagesProps {
    displayCode: string;
}

export const CharacterMessages: React.FC<CharacterMessagesProps> = ({ displayCode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchMessages = async () => {
        try {
            const data = await characterService.getMessages(displayCode);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [displayCode]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            await characterService.sendMessage(displayCode, newMessage);
            setNewMessage('');
            fetchMessages();
            toast.success('留言发送成功');
        } catch (error) {
            toast.error('发送失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 max-w-2xl mx-auto w-full px-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                留言 ({messages.length})
            </h3>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="h-[300px] overflow-y-auto pr-4 mb-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">暂无留言，快来发第一条吧！</div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map((msg) => (
                                <div key={msg.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                                    <p className="text-gray-800 dark:text-gray-200 break-words">{msg.content}</p>
                                    <p className="text-xs text-gray-400 mt-1 text-right">
                                        {new Date(msg.created_at).toLocaleString('zh-CN', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                        placeholder="写下你的留言..."
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
                        maxLength={500}
                        className="flex-1 bg-white dark:bg-gray-700"
                    />
                    <Button onClick={handleSend} disabled={loading || !newMessage.trim()}>
                        {loading ? '发送中' : '发送'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
