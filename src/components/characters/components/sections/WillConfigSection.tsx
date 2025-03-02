import React, { useState, useEffect } from 'react';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { CheckIcon, XIcon, MinusIcon } from 'lucide-react';
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
  onUpdate,
  isLoading
}) => {
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [newCcEmail, setNewCcEmail] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [timeoutHours, setTimeoutHours] = useState<number>(24); // 默认24小时
  const [content, setContent] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

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
    
    setCcEmails([...ccEmails, newCcEmail]);
    setNewCcEmail('');
    setEmailError('');
    
    // 更新到服务器
    onUpdate('cc_emails', [...ccEmails, newCcEmail])
      .then(() => toast.success('抄送邮箱已添加'))
      .catch(() => {
        setCcEmails(ccEmails); // 恢复原状态
        toast.error('添加抄送邮箱失败');
      });
  };

  // 移除抄送邮箱
  const handleRemoveCcEmail = (email: string) => {
    const newCcEmails = ccEmails.filter(e => e !== email);
    setCcEmails(newCcEmails);
    
    // 更新到服务器
    onUpdate('cc_emails', newCcEmails)
      .then(() => toast.success('抄送邮箱已移除'))
      .catch(() => {
        setCcEmails(ccEmails); // 恢复原状态
        toast.error('移除抄送邮箱失败');
      });
  };

  // 更新主要收件人
  const handleUpdateTargetEmail = () => {
    if (!targetEmail) {
      setEmailError('请输入主要收件人邮箱');
      return;
    }
    
    if (!validateEmail(targetEmail)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }
    
    setEmailError('');
    
    // 确保同时发送content字段，避免后端创建新记录时出错
    onUpdate('target_email', targetEmail)
      .then(() => {
        toast.success('主要收件人已更新');
      })
      .catch(() => {
        toast.error('更新主要收件人失败');
      });
  };

  // 更新启用状态
  const handleToggleEnabled = async () => {
    if (!isEnabled && !targetEmail) {
      toast.error('请先设置主要收件人邮箱');
      return;
    }
    
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    try {
      // 只发送is_enabled字段
      await onUpdate('is_enabled', newState);
      toast.success(newState ? '遗嘱功能已启用' : '遗嘱功能已禁用');
    } catch (error) {
      setIsEnabled(isEnabled); // 恢复原状态
      toast.error(newState ? '启用遗嘱功能失败' : '禁用遗嘱功能失败');
    }
  };

  // 更新触发时间
  const handleUpdateTimeoutHours = (value: number[]) => {
    const hours = value[0];
    setTimeoutHours(hours);
  };

  const handleSaveTimeoutHours = () => {
    onUpdate('timeout_hours', timeoutHours)
      .then(() => toast.success('触发时间已更新'))
      .catch(() => toast.error('更新触发时间失败'));
  };

  // 更新遗嘱内容
  const handleUpdateContent = () => {
    onUpdate('content', content)
      .then(() => toast.success('遗嘱内容已更新'))
      .catch(() => toast.error('更新遗嘱内容失败'));
  };

  // 格式化时间显示
  const formatTimeoutDisplay = (hours: number): string => {
    if (hours < 24) {
      return `${hours}小时`;
    } else if (hours < 168) {
      return `${Math.floor(hours / 24)}天${hours % 24 > 0 ? `${hours % 24}小时` : ''}`;
    } else if (hours < 720) {
      return `${Math.floor(hours / 168)}周${Math.floor((hours % 168) / 24) > 0 ? `${Math.floor((hours % 168) / 24)}天` : ''}`;
    } else {
      return `${Math.floor(hours / 720)}月${Math.floor((hours % 720) / 24) > 0 ? `${Math.floor((hours % 720) / 24)}天` : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">主要收件人</h3>
        <div className="flex space-x-2">
          <Input
            value={targetEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetEmail(e.target.value)}
            placeholder="请输入邮箱地址"
            className="flex-1"
          />
          <Button 
            onClick={handleUpdateTargetEmail}
            disabled={isLoading || !targetEmail}
          >
            保存
          </Button>
        </div>
        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
        <p className="text-xs text-gray-500 mt-1">
          主要收件人将在触发条件满足时收到遗嘱邮件
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">抄送人列表</h3>
        <div className="flex space-x-2 mb-2">
          <Input
            value={newCcEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCcEmail(e.target.value)}
            placeholder="请输入抄送邮箱"
            className="flex-1"
          />
          <Button 
            onClick={handleAddCcEmail}
            disabled={isLoading || !newCcEmail}
          >
            添加
          </Button>
        </div>
        
        {ccEmails.length > 0 ? (
          <div className="space-y-2 mt-2">
            {ccEmails.map((email, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm truncate">{email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCcEmail(email)}
                  disabled={isLoading}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">暂无抄送人</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">启用遗嘱功能</h3>
        <div className="flex justify-center items-center space-x-2">
          <AnimatedSubscribeButton 
            className="w-32 h-9"
            subscribeStatus={isEnabled}
            onClick={handleToggleEnabled}
            disabled={!targetEmail}
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
        <p className="text-xs text-gray-500 mt-1">
          {isEnabled ? '当前状态：已启用' : '当前状态：已禁用'} - 启用后，系统将在指定时间内未收到状态更新时发送遗嘱邮件
        </p>
      </div>

      {isEnabled && (
        <>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              触发时间: {formatTimeoutDisplay(timeoutHours)}
            </h3>
            <div className="space-y-4">
              <input
                type="range"
                value={timeoutHours}
                min={24}
                max={8760}
                step={24}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateTimeoutHours([parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1天</span>
                <span>1周</span>
                <span>1月</span>
                <span>1年</span>
              </div>
              <Button 
                onClick={handleSaveTimeoutHours}
                disabled={isLoading}
                className="w-full"
              >
                保存触发时间
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              如果在设定的时间内未收到状态更新，系统将自动发送遗嘱邮件
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">遗嘱内容</h3>
            <div className="space-y-2">
              <textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="请输入遗嘱内容..."
                className="min-h-[150px] w-full p-2 border rounded-md"
              />
              <Button 
                onClick={handleUpdateContent}
                disabled={isLoading}
                className="w-full"
              >
                保存遗嘱内容
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              遗嘱内容将在触发条件满足时发送给收件人，如不填写将使用默认内容
            </p>
          </div>
        </>
      )}
    </div>
  );
}; 