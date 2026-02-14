import React from 'react';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';

interface ClearableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  error?: boolean;
}

export const ClearableInput: React.FC<ClearableInputProps> = ({
  value,
  onChange,
  onClear,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        className={`${error ? 'border-red-300' : ''} pr-8 ${className}`}
        style={{
          paddingRight: '2.5rem', // 确保文字不会被按钮遮挡
        }}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}; 