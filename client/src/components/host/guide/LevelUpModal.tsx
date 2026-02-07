'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, newLevel }) => {
  useEffect(() => {
    if (isOpen) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ffe400', '#ff0000', '#2dff00', '#0047fa']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ffe400', '#ff0000', '#2dff00', '#0047fa']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [isOpen]);

  console.log('Rendering LevelUpModal, isOpen:', isOpen); // Debug

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-5000 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            className="relative bg-white rounded-3xl p-8 max-w-[384px] w-full text-center shadow-2xl border-4 border-yellow-300"
          >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
                <X size={20} className="text-neutral-400" />
            </button>

            <motion.div 
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
                <Trophy size={48} className="text-yellow-900" />
            </motion.div>

            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Level Up!</h2>
            <p className="text-neutral-500 mb-6">
                Congratulations! You've reached <span className="text-brand-600 font-bold">Level {newLevel}</span>.
                Your event is getting closer to perfection.
            </p>

            <button 
                onClick={onClose}
                className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
            >
                Claim Rewards
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
