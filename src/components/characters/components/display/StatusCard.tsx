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
          <p className="text-xl font-semibold">
            {value !== undefined ? (
              <>
                {value}
                {suffix && (
                  <span className="text-sm ml-1 text-gray-500">{suffix}</span>
                )}
              </>
            ) : (
              '--'
            )}
          </p>
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
            <span className="text-xl font-semibold text-gray-900">
              {value !== undefined ? (
                <>
                  {value}
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