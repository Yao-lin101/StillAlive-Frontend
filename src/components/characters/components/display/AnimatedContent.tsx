import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SpinningText } from "@/components/magicui/spinning-text";

interface AnimatedContentProps {
  isHidden: boolean;
  onShow: () => void;
  children: React.ReactNode;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  isHidden,
  onShow,
  children
}) => {
  return (
    <div className="relative">
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
              className="text-white text-2xl font-medium cursor-pointer select-none"
            >
              <SpinningText
                duration={8}
                className="w-32 h-32"
              >
                CLICK TO VIEW STATUS INFORMATION
              </SpinningText>
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
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 