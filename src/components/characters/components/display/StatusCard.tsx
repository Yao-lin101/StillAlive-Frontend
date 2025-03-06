import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from "@/lib/utils";

interface StatusCardProps {
  label: string;
  description?: string;
  value: any;
  suffix?: string;
  onClick?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
  timestamp?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  label,
  description,
  value,
  suffix,
  onClick,
  variant = 'default',
  className,
  timestamp
}) => {
  // 处理长文本的函数
  const formatValue = (val: any) => {
    if (typeof val !== 'string') return val;
    
    // 如果文本长度超过20个字符，使用自动换行样式
    return val.length > 20 ? (
      <span className="break-words whitespace-pre-wrap text-base leading-normal">
        {val}
      </span>
    ) : val;
  };

  if (variant === 'compact') {
    return (
      <Card className={cn(
        "p-4",
        className
      )}>
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium">{label}</h3>
            {timestamp && (
              <span className="text-xs text-gray-500">
                {timestamp}
              </span>
            )}
          </div>
          <div className={cn(
            "font-semibold",
            typeof value === 'string' && value.length > 20 ? "text-base" : "text-xl"
          )}>
            {value !== undefined ? (
              <>
                {formatValue(value)}
                {suffix && (
                  <span className="text-sm ml-1 text-gray-500">{suffix}</span>
                )}
              </>
            ) : (
              '--'
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "relative w-64 h-[120px] overflow-hidden bg-white/50 backdrop-blur-sm group cursor-pointer",
        "hover:bg-white/60 transition-colors duration-200",
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 h-full flex flex-col">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        <div className="relative flex-1">
          {description && (
            <p className="text-xs text-gray-500 mt-1 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {description}
            </p>
          )}
          <div className="absolute bottom-0 left-0 right-0">
            <span className={cn(
              "font-semibold text-gray-900",
              typeof value === 'string' && value.length > 20 ? "text-base" : "text-xl"
            )}>
              {value !== undefined ? (
                <>
                  {formatValue(value)}
                  {suffix && (
                    <span className="text-sm ml-1 text-gray-500">{suffix}</span>
                  )}
                </>
              ) : (
                '--'
              )}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}; 