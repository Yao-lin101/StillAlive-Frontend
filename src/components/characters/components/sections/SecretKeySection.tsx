import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SecretKeySectionProps {
  secretKey: string | null;
  isRegeneratingKey: boolean;
  showRegenerateConfirm: boolean;
  onRegenerateKey: () => Promise<void>;
  onCancelRegenerate: () => void;
  onShowRegenerateConfirm: () => void;
}

export const SecretKeySection: React.FC<SecretKeySectionProps> = ({
  secretKey,
  isRegeneratingKey,
  showRegenerateConfirm,
  onRegenerateKey,
  onCancelRegenerate,
  onShowRegenerateConfirm
}) => {
  const handleCopyKey = async () => {
    if (!secretKey) return;
    try {
      await navigator.clipboard.writeText(secretKey);
      toast.success("密钥已复制到剪贴板");
    } catch (err) {
      toast.error("复制失败，请手动长按密钥进行复制");
    }
  };

  return (
    <div className="pt-4 border-t">
      <h3 className="text-sm font-medium text-gray-500 mb-2">密钥管理</h3>
      <div className="space-y-2">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          {secretKey ? (
            <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">{secretKey}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">密钥未生成</p>
          )}
        </div>
        <div className="space-x-2">
          {secretKey && (
            <Button
              variant="outline"
              onClick={handleCopyKey}
            >
              复制密钥
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onShowRegenerateConfirm}
            disabled={isRegeneratingKey}
          >
            {isRegeneratingKey ? '生成中...' : '重新生成密钥'}
          </Button>
        </div>

        <Dialog open={showRegenerateConfirm} onOpenChange={onCancelRegenerate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>重新生成密钥</DialogTitle>
              <DialogDescription>
                重新生成密钥后，原有密钥将立即失效。此操作不可撤销，是否继续？
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={onCancelRegenerate}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={onRegenerateKey}
                disabled={isRegeneratingKey}
              >
                {isRegeneratingKey ? '生成中...' : '确认重新生成'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}; 