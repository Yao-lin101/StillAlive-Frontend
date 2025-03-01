import React from 'react';
import { Button } from '@/components/ui/button';
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
  onShowSecretKey: () => Promise<void>;
  onRegenerateKey: () => Promise<void>;
  onCancelRegenerate: () => void;
  onShowRegenerateConfirm: () => void;
}

export const SecretKeySection: React.FC<SecretKeySectionProps> = ({
  secretKey,
  isRegeneratingKey,
  showRegenerateConfirm,
  onShowSecretKey,
  onRegenerateKey,
  onCancelRegenerate,
  onShowRegenerateConfirm
}) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="text-sm font-medium text-gray-500 mb-2">密钥管理</h3>
      <div className="space-y-2">
        {secretKey ? (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="font-mono text-sm break-all">{secretKey}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">点击下方按钮查看或重新生成密钥</p>
        )}
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={onShowSecretKey}
            disabled={!!secretKey}
          >
            查看密钥
          </Button>
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