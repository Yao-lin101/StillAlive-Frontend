import React, { useState, useEffect } from 'react';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { CheckIcon, XIcon, MinusIcon, Mail, Clock, FileText, Shield, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { WillConfig } from '@/types/character';
import { toast } from 'sonner';

interface WillConfigSectionProps {
  characterUid: string;
  willConfig: WillConfig | null;
  onUpdate: (field: keyof WillConfig, value: any) => Promise<WillConfig | void>;
  isLoading: boolean;
}

export const WillConfigSection: React.FC<WillConfigSectionProps> = ({
  willConfig,
  onUpdate
}) => {
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [newCcEmail, setNewCcEmail] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [timeoutHours, setTimeoutHours] = useState<number>(24); // 默认24小时
  const [content, setContent] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  // 为各个操作添加独立的loading状态
  const [isUpdatingEmail, setIsUpdatingEmail] = useState<boolean>(false);
  const [isUpdatingCcEmail, setIsUpdatingCcEmail] = useState<boolean>(false);
  const [isTogglingEnabled, setIsTogglingEnabled] = useState<boolean>(false);
  const [isUpdatingTimeout, setIsUpdatingTimeout] = useState<boolean>(false);
  const [isUpdatingContent, setIsUpdatingContent] = useState<boolean>(false);

  // 初始化数据
  useEffect(() => {
    if (willConfig) {
      setTargetEmail(willConfig.target_email || '');
      setCcEmails(willConfig.cc_emails || []);
      setIsEnabled(willConfig.is_enabled || false);
      setTimeoutHours(willConfig.timeout_hours || 168);
      setContent(willConfig.content || '');
    }
  }, [willConfig]);

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // 添加抄送邮箱
  const handleAddCcEmail = () => {
    if (!newCcEmail) return;

    if (!validateEmail(newCcEmail)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }

    if (ccEmails.includes(newCcEmail)) {
      setEmailError('该邮箱已在抄送列表中');
      return;
    }

    if (ccEmails.length >= 5) {
      setEmailError('最多添加5个抄送邮箱');
      return;
    }

    const newCcEmails = [...ccEmails, newCcEmail];
    setCcEmails(newCcEmails);
    setNewCcEmail('');
    setEmailError('');

    // 更新到服务器
    setIsUpdatingCcEmail(true);
    onUpdate('cc_emails', newCcEmails)
      .then(() => toast.success('抄送邮箱已添加'))
      .catch(() => {
        setCcEmails(ccEmails); // 恢复原状态
        toast.error('添加抄送邮箱失败');
      })
      .finally(() => setIsUpdatingCcEmail(false));
  };

  // 移除抄送邮箱
  const handleRemoveCcEmail = (email: string) => {
    const newCcEmails = ccEmails.filter(e => e !== email);
    setCcEmails(newCcEmails);

    // 更新到服务器
    setIsUpdatingCcEmail(true);
    onUpdate('cc_emails', newCcEmails)
      .then(() => toast.success('抄送邮箱已移除'))
      .catch(() => {
        setCcEmails(ccEmails); // 恢复原状态
        toast.error('移除抄送邮箱失败');
      })
      .finally(() => setIsUpdatingCcEmail(false));
  };

  // 更新主要对象
  const handleUpdateTargetEmail = () => {
    if (!targetEmail) {
      setEmailError('请输入主要对象邮箱');
      return;
    }

    if (!validateEmail(targetEmail)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }

    setEmailError('');

    // 确保同时发送content字段，避免后端创建新记录时出错
    setIsUpdatingEmail(true);
    onUpdate('target_email', targetEmail)
      .then(() => {
        toast.success('主要对象已更新');
      })
      .catch(() => {
        toast.error('更新主要对象失败');
      })
      .finally(() => setIsUpdatingEmail(false));
  };

  // 更新启用状态
  const handleToggleEnabled = async () => {
    // 检查是否有服务器返回的target_email，而不是本地状态
    if (!isEnabled && (!willConfig || !willConfig.target_email)) {
      toast.error('请先设置主要对象邮箱');
      return;
    }

    const newState = !isEnabled;
    setIsEnabled(newState);

    try {
      setIsTogglingEnabled(true);
      // 只发送is_enabled字段
      await onUpdate('is_enabled', newState);
      toast.success(newState ? '亡语功能已启用' : '亡语功能已禁用');
    } catch (error) {
      setIsEnabled(isEnabled); // 恢复原状态
      toast.error(newState ? '启用亡语功能失败' : '禁用亡语功能失败');
    } finally {
      setIsTogglingEnabled(false);
    }
  };

  // 更新触发时间
  const handleUpdateTimeoutHours = (value: number[]) => {
    const hours = value[0];
    setTimeoutHours(hours);
  };

  const handleSaveTimeoutHours = () => {
    setIsUpdatingTimeout(true);
    onUpdate('timeout_hours', timeoutHours)
      .then(() => toast.success('触发时间已更新'))
      .catch(() => toast.error('更新触发时间失败'))
      .finally(() => setIsUpdatingTimeout(false));
  };

  // 更新亡语内容
  const handleUpdateContent = () => {
    setIsUpdatingContent(true);
    onUpdate('content', content)
      .then(() => toast.success('亡语内容已更新'))
      .catch(() => toast.error('更新亡语内容失败'))
      .finally(() => setIsUpdatingContent(false));
  };

  // 格式化时间显示，只显示天数
  const formatTimeoutDisplay = (hours: number): string => {
    const days = Math.floor(hours / 24);
    return `${days}天`;
  };

  // 检查是否有主要收件人邮箱
  const hasTargetEmail = willConfig?.target_email || targetEmail;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 联系人配置卡片 */}
        <Card className="p-6 space-y-6 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">联系人配置</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">主要对象</label>
              <div className="flex space-x-2">
                <Input
                  value={targetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  className="flex-1"
                />
                <Button
                  onClick={handleUpdateTargetEmail}
                  disabled={isUpdatingEmail || !targetEmail}
                  className="bg-[#eaf5fb] hover:bg-[#d6ebf7] text-[#65a8ec] border-none dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  {isUpdatingEmail ? '保存' : '保存'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">主要对象将在触发条件满足时收到亡语</p>
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <label className="text-sm font-medium text-gray-500 mb-2 block">次要对象列表</label>
              <div className="flex space-x-2 mb-3">
                <Input
                  value={newCcEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCcEmail(e.target.value)}
                  placeholder={hasTargetEmail ? "请输入抄送邮箱" : "请先设置主要对象邮箱"}
                  className="flex-1"
                  disabled={!hasTargetEmail || isUpdatingCcEmail}
                />
                <Button
                  onClick={handleAddCcEmail}
                  disabled={isUpdatingCcEmail || !newCcEmail || !hasTargetEmail}
                  className="bg-[#eaf5fb] hover:bg-[#d6ebf7] text-[#65a8ec] border-none dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  {isUpdatingCcEmail ? '添加' : '添加'}
                </Button>
              </div>

              {ccEmails.length > 0 ? (
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                  {ccEmails.map((email, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded border border-gray-100 dark:border-gray-700 dark:text-slate-200">
                      <span className="text-sm truncate flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {email}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCcEmail(email)}
                        disabled={isUpdatingCcEmail}
                        className="h-6 w-6 p-0 bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                      >
                        <MinusIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">
                    {hasTargetEmail ? "暂无次要对象" : "请先设置主要对象邮箱"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 功能设置卡片 */}
        <Card className="p-6 space-y-6 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">功能设置</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
              <label className="text-sm font-medium text-gray-500 mb-3 block">亡语功能开关</label>
              <AnimatedSubscribeButton
                key={`will-enabled-${isEnabled}`}
                className="w-36 h-10 shadow-sm"
                subscribeStatus={isEnabled}
                onClick={handleToggleEnabled}
                disabled={isTogglingEnabled || (!isEnabled && !hasTargetEmail)}
              >
                <span className="group inline-flex items-center font-medium">
                  <XIcon className="mr-2 size-4" />
                  已禁用
                </span>
                <span className="group inline-flex items-center font-medium">
                  <CheckIcon className="mr-2 size-4" />
                  已启用
                </span>
              </AnimatedSubscribeButton>
              <p className="text-xs text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed">
                {isEnabled
                  ? '系统将在指定时间内未收到状态更新时自动发送亡语邮件'
                  : '启用后，系统将监控您的状态更新并在超时后触发亡语'}
              </p>
            </div>

            {isEnabled && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">触发时间设置</span>
                </div>

                <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-500">超时阈值</span>
                    <span className="text-sm font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                      {formatTimeoutDisplay(timeoutHours)}
                    </span>
                  </div>

                  <input
                    type="range"
                    value={timeoutHours}
                    min={24}
                    max={8760}
                    step={24}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateTimeoutHours([parseInt(e.target.value)])}
                    className="w-full mb-4 accent-orange-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />

                  <Button
                    onClick={handleSaveTimeoutHours}
                    disabled={isUpdatingTimeout}
                    className="w-full bg-[#eaf5fb] hover:bg-[#d6ebf7] text-[#65a8ec] border-none dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 h-9"
                  >
                    {isUpdatingTimeout ? '保存中...' : '保存触发时间'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 亡语内容卡片 */}
        {isEnabled && (
          <Card className="p-6 lg:col-span-2 space-y-4 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">亡语内容</h3>
            </div>

            <div className="space-y-4">
              <textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="在此输入您的亡语内容... 当触发条件满足时，系统将发送此内容给指定对象。"
                className="min-h-[180px] w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-950/50 dark:text-white resize-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all font-sans leading-relaxed"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleUpdateContent}
                  disabled={isUpdatingContent}
                  className="w-full sm:w-auto min-w-[120px] bg-[#eaf5fb] hover:bg-[#d6ebf7] text-[#65a8ec] border-none dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  {isUpdatingContent ? '保存中...' : '保存内容'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400">
              提示：您可以点击"保存内容"按钮随时更新亡语内容，更新不会重置触发计时器。
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}; 