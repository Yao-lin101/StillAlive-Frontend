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

  const handleSave = async () => {
    console.log('StatusCard - Saving config for key:', statusKey, localConfig);
    // 获取父组件的完整配置
    const parentConfig = config.__parent || {};
    // 更新特定状态的配置
    const newConfig = {
      ...parentConfig,
      vital_signs: {
        ...(parentConfig.vital_signs || {}),
        [statusKey]: localConfig
      }
    };
    console.log('StatusCard - Full config to save:', newConfig);
    onUpdate(localConfig);
    await onSave(newConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (isNew) {
      onDelete();
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
              类型: {config.valueType === 'number' ? '数值' : config.valueType === 'text' ? '文本' : config.valueType === 'boolean' ? '布尔值' : '字符串'}
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

      <Dialog open={isEditing} onOpenChange={isNew ? undefined : setIsEditing}>
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
                <Input
                  value={localConfig.key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({
                    ...localConfig,
                    key: e.target.value
                  })}
                  placeholder="用于API通信的键名"
                />
              </div>
              <div>
                <Label>显示名称</Label>
                <Input
                  value={localConfig.label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({
                    ...localConfig,
                    label: e.target.value
                  })}
                  placeholder="在界面上显示的名称"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>值类型</Label>
                <Select
                  value={localConfig.valueType}
                  onValueChange={(value) => {
                    const valueType = value as 'number' | 'text' | 'string' | 'boolean';
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
                    <SelectItem value="string">字符串</SelectItem>
                    <SelectItem value="boolean">布尔值</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>描述</Label>
                <Input
                  value={localConfig.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({
                    ...localConfig,
                    description: e.target.value
                  })}
                  placeholder="状态的描述信息"
                />
              </div>
            </div>
            {localConfig.valueType === 'number' && (
              <div>
                <Label>单位</Label>
                <Input
                  value={localConfig.suffix || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({
                    ...localConfig,
                    suffix: e.target.value
                  })}
                  placeholder="例如：%、℃"
                />
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