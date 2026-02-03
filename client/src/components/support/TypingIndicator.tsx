import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

interface TypingIndicatorProps {
  showTimeout: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ showTimeout }) => {
  const dotTransition = {
    duration: 1.2,
    repeat: Infinity,
    ease: "easeInOut" as const
  };

  return (
    <div className="flex justify-start">
      <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
        <Logo className="w-4 h-4 text-brand-500" />
      </div>
      <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-600 max-w-[70%]">
        {!showTimeout ? (
          <div className="flex items-center gap-1 h-[14px]">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                initial={{ y: 0 }}
                animate={{ y: [-3, 3, -3] }}
                transition={{
                  ...dotTransition,
                  delay: i * 0.15, // Stagger effect for the "wave"
                }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[12px] font-[300] text-slate-500"
          >
            Taking longer than usual... try sending the message again please.
          </motion.div>
        )}
      </div>
    </div>
  );
};
