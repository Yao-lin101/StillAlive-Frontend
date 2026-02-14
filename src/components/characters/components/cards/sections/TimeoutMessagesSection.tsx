import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Music, PlusIcon } from 'lucide-react';
import { DisplayConfig } from '@/types/displayConfig';

interface TimeoutMessagesSectionProps {
  config: DisplayConfig;
  onEdit: (index: number) => void;
  onAdd: () => void;
}

export const TimeoutMessagesSection: React.FC<TimeoutMessagesSectionProps> = ({
  config,
  onEdit,
  onAdd
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="font-medium">超时状态配置</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={config.timeout_messages.length >= 10}
          title={config.timeout_messages.length >= 10 ? "最多添加10个超时状态" : ""}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          添加
          {config.timeout_messages.length >= 10 && (
            <span className="ml-1 text-xs">(已达上限)</span>
          )}
        </Button>
      </div>

      {config.timeout_messages.length === 0 ? (
        <p className="text-sm text-gray-500 italic p-4 text-center border rounded-md">
          暂无超时状态配置
        </p>
      ) : (
        <div
          className="space-y-2 mt-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar"
        >
          {config.timeout_messages.map((msg, index) => (
            <div
              key={index}
              className="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => onEdit(index)}
            >
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">{msg.hours} 小时后</p>
                  {msg.music_link && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <Music className="h-3 w-3 mr-1" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 w-full text-left">
                  {msg.message || '(无消息)'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 