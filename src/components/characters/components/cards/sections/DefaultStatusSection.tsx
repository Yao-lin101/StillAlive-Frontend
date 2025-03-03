import React from 'react';
import { Label } from '@/components/ui/label';
import { Music } from 'lucide-react';
import { DisplayConfig } from '@/types/displayConfig';

interface DefaultStatusSectionProps {
  config: DisplayConfig;
  onEdit: () => void;
}

export const DefaultStatusSection: React.FC<DefaultStatusSectionProps> = ({
  config,
  onEdit
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="font-medium">默认状态文本</Label>
      </div>
      <div 
        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={onEdit}
      >
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium">默认状态</p>
            {config.default_music_url && (
              <span className="text-xs text-gray-500 flex items-center">
                <Music className="h-3 w-3 mr-1" />
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 w-full text-left">
            {config.default_message}
          </p>
        </div>
      </div>
    </div>
  );
}; 