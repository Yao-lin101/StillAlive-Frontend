import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DisplayLinkSectionProps {
  displayCode: string | null;
  baseUrl: string;
  onRegenerateLink: () => Promise<void>;
  isSaving: boolean;
}

export const DisplayLinkSection: React.FC<DisplayLinkSectionProps> = ({
  displayCode,
  baseUrl,
  onRegenerateLink,
  isSaving
}) => {
  const displayUrl = displayCode ? `${baseUrl}/d/${displayCode}` : null;

  const handleCopyLink = async () => {
    if (!displayUrl) return;
    try {
      await navigator.clipboard.writeText(displayUrl);
      toast.success("展示链接已复制到剪贴板");
    } catch (err) {
      toast.error("复制链接失败");
    }
  };

  return (
    <div className="pt-4 border-t">
      <h3 className="text-sm font-medium text-gray-500 mb-2">展示链接</h3>
      <div className="space-y-2">
        <div className="p-4 bg-gray-50 rounded-md">
          {displayUrl ? (
            <p className="font-mono text-sm break-all">{displayUrl}</p>
          ) : (
            <p className="text-sm text-gray-500">展示链接未生成</p>
          )}
        </div>
        <div className="space-x-2">
          {displayCode && (
            <Button
              variant="outline"
              onClick={handleCopyLink}
            >
              复制链接
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onRegenerateLink}
            disabled={isSaving}
          >
            {isSaving ? '生成中...' : '重新生成链接'}
          </Button>
        </div>
      </div>
    </div>
  );
}; 