import React from 'react';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { Globe, Lock } from 'lucide-react';

interface PublicStatusSectionProps {
    isPublic: boolean;
    onStatusChange: (status: boolean) => Promise<void>;
}

export const PublicStatusSection: React.FC<PublicStatusSectionProps> = ({
    isPublic,
    onStatusChange
}) => {
    return (
        <div className="pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">公开状态</h3>
            <div className="flex justify-center items-center space-x-2">
                <AnimatedSubscribeButton
                    className="w-32 h-9"
                    subscribeStatus={isPublic}
                    onClick={async () => {
                        await onStatusChange(!isPublic);
                    }}
                >
                    <span className="group inline-flex items-center">
                        <Lock className="mr-2 size-4" />
                        私密
                    </span>
                    <span className="group inline-flex items-center">
                        <Globe className="mr-2 size-4" />
                        公开
                    </span>
                </AnimatedSubscribeButton>
            </div>
            <p className="mt-1 text-xs text-gray-500">
                公开后，角色将显示在「存活者」页面供所有人浏览
            </p>
        </div>
    );
};
