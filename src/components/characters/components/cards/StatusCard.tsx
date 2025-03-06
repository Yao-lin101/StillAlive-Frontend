import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusConfig {
  key?: string;
  label: string;
  valueType?: 'number' | 'text' | 'string' | 'boolean';
  description?: string;
  suffix?: string;
  color?: {
    type: string;
    rules: Array<{
      value?: number;
      color: string;
      default?: string;
    }>;
  };
  __parent?: any;
  __index?: number;
}

interface StatusCardProps {
  statusKey: string;
  config: StatusConfig;
  onUpdate: (config: StatusConfig) => void;
  onDelete: () => void;
  onSave: (config: any) => Promise<void>;
  isSaving: boolean;
  isNew?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  statusKey,
  config,
  onUpdate,
  onDelete,
  onSave,
  isSaving,
  isNew
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [localConfig, setLocalConfig] = useState<StatusConfig>(config);
  const [keyError, setKeyError] = useState<string | null>(null);

  const validateKey = (value: string) => {
    if (!value) {
      setKeyError('键名不能为空');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setKeyError('只能包含英文、数字和下划线');
      return false;
    }

    // 检查键名是否重复，使用config.__parent获取最新的状态配置
    const parentConfig = config.__parent || {};
    const existingConfigs = Object.values(parentConfig.vital_signs || {})
      .filter(cfg => {
        // 如果是编辑现有状态，排除当前正在编辑的状态
        if (!isNew) {
          return (cfg as StatusConfig).key !== config.key;
        }
        return true;
      });
    
    // 检查是否有相同的key字段
    const hasExistingKey = existingConfigs.some(cfg => (cfg as StatusConfig).key === value);
    if (hasExistingKey) {
      setKeyError('键名已存在，请使用其他键名');
      return false;
    }

    setKeyError(null);
    return true;
  };

  const handleSave = async () => {
    // 在保存时再次验证，以防止并发编辑导致的重复
    if (!validateKey(localConfig.key || '')) {
      return;
    }

    // 清理掉内部使用的字段，只保留状态相关的字段
    const cleanConfig = {
      key: localConfig.key,
      label: localConfig.label,
      valueType: localConfig.valueType,
      description: localConfig.description,
      ...(localConfig.valueType === 'number' ? { suffix: localConfig.suffix } : {}),
    };

    // 更新并保存
    onUpdate(cleanConfig);
    await onSave(cleanConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (isNew) {
      setTimeout(() => {
        onDelete();
      }, 150); // 保持和对话框关闭动画相同的延迟时间
    } else {
      setLocalConfig(config);
    }
  };

  const handleDelete = async () => {
    try {
      onDelete();
      setIsEditing(false);
    } catch (err) {
      toast.error("删除状态失败");
    }
  };

  return (
    <>
      {!isNew && (
        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsEditing(true)}
        >
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <h5 className="text-sm font-medium">{config.label || statusKey}</h5>
            <p className="text-sm text-gray-500 truncate w-full">
              类型: {config.valueType === 'number' ? '数值' : '文本' }
              {config.suffix ? `（${config.suffix}）` : ''}
            </p>
            {config.description && (
              <p className="text-sm text-gray-500 truncate w-full">
                描述: {config.description}
              </p>
            )}
            <Settings2 className="h-4 w-4 text-gray-400 mt-2" />
          </div>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setKeyError(null);
          if (isNew) {
            setTimeout(() => {
              onDelete();
            }, 150);
          }
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? '新增状态' : '编辑状态配置'}</DialogTitle>
            <DialogDescription>
              {isNew ? '配置新的状态字段' : '修改状态的显示和行为配置'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>状态键名</Label>
                <div className="relative">
                  <Input
                    value={localConfig.key}
                    maxLength={15}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      validateKey(value);
                      setLocalConfig({
                        ...localConfig,
                        key: value
                      });
                    }}
                    placeholder="用于API通信的键名"
                    className={keyError ? 'border-red-500' : ''}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">
                    {(localConfig.key || '').length}/15
                  </span>
                </div>
                {keyError && (
                  <p className="text-xs text-red-500 mt-1">{keyError}</p>
                )}
              </div>
              <div>
                <Label>显示名称</Label>
                <div className="relative">
                  <Input
                    value={localConfig.label}
                    maxLength={10}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({
                      ...localConfig,
                      label: e.target.value
                    })}
                    placeholder="在界面上显示的名称"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">
                    {localConfig.label.length}/10
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>值类型</Label>
                <Select
                  value={localConfig.valueType}
                  onValueChange={(value) => {
                    const valueType = value as 'number' | 'text' ;
                    setLocalConfig({
                      ...localConfig,
                      valueType,
                      suffix: valueType === 'text' ? undefined : localConfig.suffix
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择值类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">数值</SelectItem>
                    <SelectItem value="text">文本</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>描述</Label>
                <div className="relative">
                  <Input
                    value={localConfig.description || ''}
                    maxLength={30}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({
                      ...localConfig,
                      description: e.target.value
                    })}
                    placeholder="状态的描述信息"
                    className="pr-12"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">
                    {(localConfig.description || '').length}/30
                  </span>
                </div>
              </div>
            </div>
            {localConfig.valueType === 'number' && (
              <div>
                <Label>单位</Label>
                <div className="relative">
                  <Input
                    value={localConfig.suffix || ''}
                    maxLength={5}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({
                      ...localConfig,
                      suffix: e.target.value
                    })}
                    placeholder="例如：%、℃"
                    className="pr-10"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">
                    {(localConfig.suffix || '').length}/5
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between pt-4">
              {!isNew && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  删除
                </Button>
              )}
              <div className={`space-x-2 ${isNew ? 'w-full flex justify-end' : ''}`}>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 