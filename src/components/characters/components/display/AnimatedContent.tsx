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
    <div className="relative w-full h-full">
      <style>
        {`
          @keyframes breathing {
            0%, 100% {
              opacity: 1;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            50% {
              opacity: 0.7;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.5);
            }
          }
          .breathing-animation {
            animation: breathing 2s ease-in-out infinite;
          }
          .text-outline {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
      <AnimatePresence>
        {(isMobile ? isHidden : true) && (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut"
            }}
            style={{ pointerEvents: isHidden ? "auto" : "none" }}
            className={cn(
              "absolute inset-0 flex cursor-pointer",
              isMobile ? "items-center justify-center" : "items-end justify-end pb-12 pr-12"
            )}
            onClick={isHidden ? onShow : undefined}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{
                scale: (!isMobile && !isHidden) ? 5 : 1, // Scale up massively on desktop
                x: (!isMobile && !isHidden) ? 100 : 0, // Move outwards
                y: (!isMobile && !isHidden) ? 100 : 0,
                opacity: (!isMobile && !isHidden) ? 0 : 1, // Fade out while scaling
              }}
              exit={{ y: -20, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className={cn(
                "text-white font-medium select-none",
                isMobile ? "text-2xl mt-32" : "text-base origin-bottom-right" // Set origin for desktop scaling
              )}
            >
              {isMobile ? (
                <div className={cn(
                  "text-outline",
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
                <div className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
                  <SpinningText
                    duration={30}
                    className="w-24 h-24 text-outline"
                    radius={5}
                  >
                    CLICK • TO • VIEW • STATUS • DATA •
                  </SpinningText>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card - always mounted, visibility controlled by animation */}
      <motion.div
        initial={false}
        animate={{
          opacity: isHidden ? 0 : 1,
          scale: isHidden ? 0.95 : 1,
          y: isHidden ? 30 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 24,
          opacity: { duration: 0.3 }, // opacity uses tween for smoother fade
        }}
        style={{ pointerEvents: isHidden ? "none" : "auto" }}
        className="absolute inset-0 overflow-y-auto"
      >
        <div className={className}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}; 