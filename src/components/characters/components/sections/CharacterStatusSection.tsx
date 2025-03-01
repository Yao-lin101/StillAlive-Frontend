import React from 'react';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { CheckIcon, XIcon } from 'lucide-react';

interface CharacterStatusSectionProps {
  isActive: boolean;
  onStatusChange: (status: boolean) => Promise<void>;
}

export const CharacterStatusSection: React.FC<CharacterStatusSectionProps> = ({
  isActive,
  onStatusChange
}) => {
  return (
    <div className="pt-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">角色状态</h3>
      <div className="flex justify-center items-center space-x-2">
        <AnimatedSubscribeButton 
          className="w-32 h-9"
          subscribeStatus={isActive}
          onClick={async () => {
            await onStatusChange(!isActive);
          }}
        >
          <span className="group inline-flex items-center">
            <XIcon className="mr-2 size-4" />
            已禁用
          </span>
          <span className="group inline-flex items-center">
            <CheckIcon className="mr-2 size-4" />
            已启用
          </span>
        </AnimatedSubscribeButton>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        禁用后，角色展示页面将无法访问
      </p>
    </div>
  );
}; 