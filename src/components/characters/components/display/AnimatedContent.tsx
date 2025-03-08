import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SpinningText } from "@/components/magicui/spinning-text";
import { HyperText } from "@/components/magicui/hyper-text";
import { cn } from "@/lib/utils";

interface AnimatedContentProps {
  isHidden: boolean;
  onShow: () => void;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  isHidden,
  onShow,
  children,
  className
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 在 HyperText 动画完成后启动呼吸效果
  useEffect(() => {
    if (isMobile && isHidden) {
      const timer = setTimeout(() => {
        setShowBreathing(true);
      }, 1500); // 1200ms 动画 + 300ms 延迟
      return () => clearTimeout(timer);
    } else {
      setShowBreathing(false);
    }
  }, [isMobile, isHidden]);

  return (
    <div className="relative">
      <style>
        {`
          @keyframes breathing {
            0%, 100% {
              opacity: 1;
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            }
            50% {
              opacity: 0.4;
              text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            }
          }
          .breathing-animation {
            animation: breathing 2s ease-in-out infinite;
          }
        `}
      </style>
      <AnimatePresence initial={false}>
        {isHidden ? (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: "easeInOut"
            }}
            className="absolute inset-0 flex items-center justify-center"
            onClick={onShow}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ 
                duration: 0.4,
                ease: "easeInOut"
              }}
              className={cn(
                "text-white text-2xl font-medium cursor-pointer select-none",
                isMobile && "mt-32" // 移动端文字向下偏移
              )}
            >
              {isMobile ? (
                <div className={cn(
                  "text-shadow-sm",
                  showBreathing && "breathing-animation"
                )}>
                  <HyperText
                    className="text-center text-2xl whitespace-nowrap"
                    duration={1200}
                    delay={300}
                    startOnView={true}
                    animateOnHover={false}
                  >
                    CLICK TO VIEW STATUS
                  </HyperText>
                </div>
              ) : (
                <SpinningText
                  duration={30}
                  className="w-32 h-32"
                >
                  CLICK TO VIEW STATUS DATA
                </SpinningText>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: "easeInOut"
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.4,
                ease: "easeInOut"
              }}
              className={className}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 