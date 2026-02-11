import React, { useState } from 'react';
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
  const [downloadingMacro, setDownloadingMacro] = useState<string | null>(null);

  const handleCopyKey = async () => {
    if (!secretKey) return;
    try {
      await navigator.clipboard.writeText(secretKey);
      toast.success("密钥已复制到剪贴板");
    } catch (err) {
      toast.error("复制失败，请手动长按密钥进行复制");
    }
  };

  // iOS - 复制密钥后跳转 iCloud 链接
  const handleInstallShortcut = async (type: 'high_freq' | 'low_freq') => {
    if (!secretKey) {
      toast.error("请先生成密钥");
      return;
    }
    try {
      await navigator.clipboard.writeText(secretKey);
    } catch { /* 失败不阻止流程 */ }

    const typeName = type === 'high_freq' ? '高频同步' : '低频同步';
    toast.success(`密钥已复制，正在跳转安装「${typeName}」快捷指令…`, {
      description: '安装时请将密钥粘贴到「X-Character-Key」字段',
      duration: 5000,
    });

    setTimeout(() => {
      window.open(characterService.SHORTCUT_ICLOUD_URLS[type], '_blank');
    }, 600);
  };

  // Android - 下载注入密钥的 .macro 文件
  const handleDownloadMacro = async (type: 'high_freq' | 'low_freq') => {
    if (!secretKey) {
      toast.error("请先生成密钥");
      return;
    }
    setDownloadingMacro(type);
    try {
      await characterService.downloadMacro(secretKey, type);
      const typeName = type === 'high_freq' ? '高频同步' : '位置同步';
      toast.success(`${typeName}配置已下载，请在 MacroDroid 中导入`);
    } catch (err) {
      toast.error("下载失败，请稍后重试");
    } finally {
      setDownloadingMacro(null);
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
            <Button variant="outline" onClick={handleCopyKey}>
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

        {/* 自动化配置下载 */}
        {secretKey && (
          <div className="mt-4 space-y-3">
            {/* iOS 快捷指令 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🍎</span>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  iOS 快捷指令
                </h4>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                点击按钮后密钥将自动复制，跳转安装页后请粘贴到「X-Character-Key」字段
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  onClick={() => handleInstallShortcut('high_freq')}
                >
                  ⚡ 高频同步
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  onClick={() => handleInstallShortcut('low_freq')}
                >
                  🌍 低频同步
                </Button>
              </div>
              <p className="text-xs text-blue-600/50 dark:text-blue-400/50 mt-2">
                高频：电池 + 当前App ｜ 低频：位置 + 天气
              </p>
            </div>

            {/* Android MacroDroid */}
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🤖</span>
                <h4 className="text-sm font-medium text-green-900 dark:text-green-200">
                  Android MacroDroid
                </h4>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                下载配置文件后在 MacroDroid 中导入即可，密钥已自动填入
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
                  onClick={() => handleDownloadMacro('high_freq')}
                  disabled={downloadingMacro !== null}
                >
                  {downloadingMacro === 'high_freq' ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      下载中…
                    </span>
                  ) : '⚡ 高频同步'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
                  onClick={() => handleDownloadMacro('low_freq')}
                  disabled={downloadingMacro !== null}
                >
                  {downloadingMacro === 'low_freq' ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      下载中…
                    </span>
                  ) : '📍 位置同步'}
                </Button>
              </div>
              <p className="text-xs text-green-600/50 dark:text-green-400/50 mt-2">
                高频：电池 + 当前App ｜ 位置同步：GPS 坐标
              </p>
            </div>
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
              <Button variant="outline" onClick={onCancelRegenerate}>
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