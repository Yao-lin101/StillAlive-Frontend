import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon, BarChart3, Eye, MapPin, Smartphone, Monitor, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VitalSignOption, StatusConfigType } from '@/types/character';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

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
                ? '系统将每天凌晨自动分析您的状态数据，生成活动日报'
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
                  <li>系统将在每天凌晨 2:00 自动分析前一天的数据</li>
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
