import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon, BarChart3, Eye, MapPin, Smartphone, Monitor, Activity, ChevronDown, ChevronUp, User, Bot, Sparkles, MessageSquareText } from 'lucide-react';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VitalSignOption, StatusConfigType, AIPersona } from '@/types/character';
import { characterService } from '@/services/characterService';
import { toast } from 'sonner';

interface DailyReportConfigSectionProps {
  characterUid: string;
  statusConfig: StatusConfigType | undefined;
}

export const DailyReportConfigSection: React.FC<DailyReportConfigSectionProps> = ({
  characterUid,
  statusConfig
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [fieldMappings, setFieldMappings] = useState<{
    phone_app?: string;
    computer_app?: string;
    steps?: string;
  }>({});
  const [persona, setPersona] = useState<string>('');
  const [aiPersona, setAiPersona] = useState<AIPersona>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [isSavingPersona, setIsSavingPersona] = useState<boolean>(false);
  const [isSavingAIPersona, setIsSavingAIPersona] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showAIPersona, setShowAIPersona] = useState<boolean>(false);

  const vitalSignOptions: VitalSignOption[] = React.useMemo(() => {
    if (!statusConfig?.vital_signs) return [];

    return Object.entries(statusConfig.vital_signs).map(([key, config]) => ({
      key: (config as any).key || key,
      label: (config as any).label || key,
      description: (config as any).description,
      valueType: (config as any).valueType
    }));
  }, [statusConfig]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const config = await characterService.getDailyReportConfig(characterUid);
        setIsEnabled(config.is_enabled);
        setVisibility(config.visibility);
        setFieldMappings(config.field_mappings || {});
        setPersona(config.persona || '');
        setAiPersona(config.ai_persona || {});
      } catch (error) {
        console.error('Failed to fetch daily report config:', error);
        toast.error('获取日报配置失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [characterUid]);

  const handleToggleEnabled = async () => {
    const newState = !isEnabled;

    try {
      setIsToggling(true);

      const hasValidMappings = Object.values(fieldMappings).some(v => v !== undefined && v !== '');

      if (newState && !hasValidMappings) {
        toast.warning('请至少配置一个要分析的字段');
        return;
      }

      await characterService.updateDailyReportConfig(characterUid, {
        is_enabled: newState
      });

      setIsEnabled(newState);
      toast.success(newState ? '日报分析已启用' : '日报分析已禁用');
    } catch (error) {
      console.error('Failed to toggle daily report:', error);
      toast.error('操作失败');
    } finally {
      setIsToggling(false);
    }
  };

  const handleSaveVisibility = async () => {
    try {
      setIsSaving(true);
      await characterService.updateDailyReportConfig(characterUid, {
        visibility
      });
      toast.success('可见范围已更新');
    } catch (error) {
      console.error('Failed to save visibility:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldMappingChange = async (field: 'phone_app' | 'computer_app' | 'steps', value: string | undefined) => {
    const newMappings = {
      ...fieldMappings,
      [field]: value || undefined
    };

    setFieldMappings(newMappings);

    try {
      await characterService.updateDailyReportConfig(characterUid, {
        field_mappings: newMappings
      });
    } catch (error) {
      console.error('Failed to save field mapping:', error);
    }
  };

  const handleSavePersona = async () => {
    try {
      setIsSavingPersona(true);
      await characterService.updateDailyReportConfig(characterUid, {
        persona: persona || ''
      });
      toast.success('角色人设已保存');
    } catch (error) {
      console.error('Failed to save persona:', error);
      toast.error('保存失败');
    } finally {
      setIsSavingPersona(false);
    }
  };

  const handleAIPersonaChange = (field: keyof AIPersona, value: string) => {
    setAiPersona(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const handleSaveAIPersona = async () => {
    try {
      setIsSavingAIPersona(true);
      await characterService.updateDailyReportConfig(characterUid, {
        ai_persona: aiPersona
      });
      toast.success('AI 人设已保存');
    } catch (error) {
      console.error('Failed to save AI persona:', error);
      toast.error('保存失败');
    } finally {
      setIsSavingAIPersona(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">日报分析</h3>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <label className="text-sm font-medium text-gray-500 mb-3 block">功能开关</label>
            <AnimatedSubscribeButton
              key={`daily-report-enabled-${isEnabled}`}
              className="w-36 h-10 shadow-sm"
              subscribeStatus={isEnabled}
              onClick={handleToggleEnabled}
              disabled={isToggling}
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
                ? '系统将每小时自动分析您的状态数据，生成活动日报'
                : '启用后，系统将自动分析您的状态数据并生成活动日报'}
            </p>
          </div>

          {isEnabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">可见范围</span>
              </div>

              <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'private' | 'public')}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all"
                >
                  <option value="private">仅自己可见</option>
                  <option value="public">所有人可见</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {visibility === 'private'
                    ? '只有您可以查看您的日报分析'
                    : '所有人都可以在展示页面查看您的日报分析'}
                </p>
                <Button
                  onClick={handleSaveVisibility}
                  disabled={isSaving}
                  className="w-full mt-3 bg-[#eaf5fb] hover:bg-[#d6ebf7] text-[#65a8ec] border-none dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 h-9"
                >
                  {isSaving ? '保存中...' : '保存可见范围'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-6 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <MapPin className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">字段映射</h3>
          </div>

          <p className="text-sm text-gray-500">
            选择您的状态字段对应的数据类型，以便系统进行正确的分析。
          </p>

          <div className="space-y-4">
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">手机正在使用的 APP</label>
              </div>
              <select
                value={fieldMappings.phone_app || ''}
                onChange={(e) => handleFieldMappingChange('phone_app', e.target.value || undefined)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all"
              >
                <option value="">-- 请选择 --</option>
                {vitalSignOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                系统将分析您的手机 APP 使用习惯和活跃时间
              </p>
            </div>

            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-purple-500" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">电脑正在使用的 APP</label>
              </div>
              <select
                value={fieldMappings.computer_app || ''}
                onChange={(e) => handleFieldMappingChange('computer_app', e.target.value || undefined)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all"
              >
                <option value="">-- 请选择 --</option>
                {vitalSignOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                系统将分析您的电脑 APP 使用习惯和活跃时间
              </p>
            </div>

            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-500" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">步数</label>
              </div>
              <select
                value={fieldMappings.steps || ''}
                onChange={(e) => handleFieldMappingChange('steps', e.target.value || undefined)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all"
              >
                <option value="">-- 请选择 --</option>
                {vitalSignOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                系统将分析您的步数变化和活动量
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>查看配置说明</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-gray-600 dark:text-gray-300 space-y-2">
                <p>
                  <strong>配置说明：</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>手机 APP 字段用于分析您的作息时间和 APP 使用偏好</li>
                  <li>电脑 APP 字段用于分析您的工作/学习习惯</li>
                  <li>步数字段用于分析您的活动量和运动规律</li>
                  <li>至少配置一个字段才能启用日报分析</li>
                  <li>系统会在每小时生成一次当日日报</li>
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-6 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
            <User className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          </div>
          <h3 className="font-semibold text-lg text-slate-800 dark:text-white">角色人设</h3>
        </div>

        <p className="text-sm text-gray-500">
          填写角色的人设信息，AI 在分析日报时会结合这些背景信息，使分析更加贴合角色的实际情况。
        </p>

        <div className="space-y-4">
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="例如：&#10;- 年龄：18岁&#10;- 职业：高中生&#10;- 日常习惯：喜欢听歌、玩游戏、刷社交软件&#10;- 常用 APP 说明：&#10;  - 网易云音乐：主要用来听流行音乐&#10;  - 微信：和同学聊天、刷朋友圈&#10;  - Chrome：用来查资料、看视频"
            className="w-full h-48 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              提示：越详细的人设信息，AI 分析的结果会越精准有趣
            </p>
            <Button
              onClick={handleSavePersona}
              disabled={isSavingPersona}
              className="bg-[#eaf5fb] hover:bg-[#d6ebf7] text-[#65a8ec] border-none dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 h-9"
            >
              {isSavingPersona ? '保存中...' : '保存人设'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Bot className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">AI 人设配置</h3>
          </div>
          <button
            onClick={() => setShowAIPersona(!showAIPersona)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {showAIPersona ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showAIPersona ? '收起' : '展开'}</span>
          </button>
        </div>

        <p className="text-sm text-gray-500">
          自定义分析日报时 AI 的身份和风格。不填写则使用默认的「毒舌但精准的生活数据分析专家」人设。
        </p>

        {showAIPersona && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">核心身份</label>
              </div>
              <input
                type="text"
                value={aiPersona.core_identity || ''}
                onChange={(e) => handleAIPersonaChange('core_identity', e.target.value)}
                placeholder="例如：毒舌但精准的生活数据分析专家、温和的生活顾问、幽默的观察家"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">
                定义 AI 在分析日报时扮演的角色身份
              </p>
            </div>

            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-rose-500" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">性格特征</label>
              </div>
              <textarea
                value={aiPersona.personality_traits || ''}
                onChange={(e) => handleAIPersonaChange('personality_traits', e.target.value)}
                placeholder="例如：&#10;- 毒舌、尖锐、喜欢吐槽&#10;- 温和、鼓励、善于发现闪光点&#10;- 幽默风趣、喜欢用梗"
                className="w-full h-24 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                描述 AI 的性格特点（可选）
              </p>
            </div>

            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareText className="w-4 h-4 text-blue-500" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">语言风格</label>
              </div>
              <textarea
                value={aiPersona.language_style || ''}
                onChange={(e) => handleAIPersonaChange('language_style', e.target.value)}
                placeholder="例如：&#10;- 毒舌、尖锐、抽象、有梗。口语化，可适当使用网络流行语。多用 emoji 增加表现力。&#10;- 亲切自然、富有同理心、适当使用鼓励性的表达。&#10;- 专业严谨、客观理性、用词精准。"
                className="w-full h-24 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                定义 AI 的语言表达风格（如果不填，将根据核心身份自动适配）
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <p>
                <strong>⚠️ 重要提示：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>以下硬性约束始终生效，无法通过人设配置修改：</li>
                <li>• 必须基于实际数据进行分析，不能凭空捏造</li>
                <li>• 数据局限性规则（前台应用、步数累计等）</li>
                <li>• 所有时间均为北京时间</li>
              </ul>
            </div>

            <div className="flex items-center justify-end">
              <Button
                onClick={handleSaveAIPersona}
                disabled={isSavingAIPersona}
                className="bg-[#eaf5fb] hover:bg-[#d6ebf7] text-[#65a8ec] border-none dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 h-9"
              >
                {isSavingAIPersona ? '保存中...' : '保存 AI 人设'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
