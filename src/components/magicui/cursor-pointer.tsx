import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CursorPointerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CursorPointer: React.FC<CursorPointerProps> = ({ 
  children, 
  className,
  ...props 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return; // 移动端不处理鼠标事件

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, [isMobile]);

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="cursor-none" {...props}>
      <div
        className={cn(
          "pointer-events-none fixed left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-100 ease-linear",
          className
        )}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 0L9.67723 6.32277L16 8L9.67723 9.67723L8 16L6.32277 9.67723L0 8L6.32277 6.32277L8 0Z" />
        </svg>
      </div>
      {children}
    </div>
  );
}; 