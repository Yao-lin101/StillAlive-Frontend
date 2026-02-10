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
import { characterService } from '@/services/characterService';

interface SecretKeySectionProps {
  secretKey: string | null;
  isRegeneratingKey: boolean;
  showRegenerateConfirm: boolean;
  characterUid: string;
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

  const handleInstallShortcut = async (type: 'high_freq' | 'low_freq') => {
    if (!secretKey) {
      toast.error("请先生成密钥");
      return;
    }

    // 先复制密钥到剪贴板
    try {
      await navigator.clipboard.writeText(secretKey);
    } catch {
      // 剪贴板写入失败不阻止流程
    }

    const typeName = type === 'high_freq' ? '高频同步' : '低频同步';
    toast.success(`密钥已复制，正在跳转安装「${typeName}」快捷指令…`, {
      description: '安装时请将密钥粘贴到「X-Character-Key」字段',
      duration: 5000,
    });

    // 短暂延迟后跳转，让 toast 显示出来
    setTimeout(() => {
      window.open(characterService.SHORTCUT_ICLOUD_URLS[type], '_blank');
    }, 600);
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

        {/* 快捷指令安装 */}
        {secretKey && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                快捷指令安装
              </h4>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
              点击下方按钮，密钥将自动复制，然后跳转到快捷指令安装页面。安装时请粘贴密钥。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                onClick={() => handleInstallShortcut('high_freq')}
              >
                <span className="flex items-center gap-1.5">
                  ⚡ 安装高频同步
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                onClick={() => handleInstallShortcut('low_freq')}
              >
                <span className="flex items-center gap-1.5">
                  🌍 安装低频同步
                </span>
              </Button>
            </div>
            <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-2">
              高频：电池 + 当前App &nbsp;|&nbsp; 低频：位置 + 天气
            </p>
          </div>
        )}

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