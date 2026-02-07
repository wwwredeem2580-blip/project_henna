'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface GamificationHeaderProps {
  currentLevel: number;
  completedItemsCount: number;
  totalItemsCount: number;
  earnedBadges: string[];
}

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({ 
  currentLevel, 
  completedItemsCount, 
  totalItemsCount,
  earnedBadges 
}) => {
  const progressPercentage = Math.min(100, Math.round((completedItemsCount / totalItemsCount) * 100)) || 0;

  return (
    <div className="w-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

      <div className="relative z-0 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Level Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
               <Trophy className="text-yellow-300 drop-shadow-md" size={32} />
            </div>
            <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="absolute -bottom-2 -right-2 bg-yellow-400 text-brand-900 text-xs font-bold px-2 py-0.5 rounded-full border border-white shadow-md w-6 h-6 flex items-center justify-center"
            >
               {currentLevel}
            </motion.div>
          </div>
          <div>
             <h2 className="text-lg font-bold text-white">Event Host Level {currentLevel}</h2>
             <p className="text-brand-100 text-xs font-medium">Keep going to unlock more badges!</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 w-full md:max-w-[448px]">
            <div className="flex justify-between text-xs font-medium mb-2 text-brand-100">
                <span>Event Readiness</span>
                <span>{progressPercentage}%</span>
            </div>
            <div className="h-3 bg-brand-900/40 rounded-full overflow-hidden backdrop-blur-sm border border-brand-500/30">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-[0_0_10px_rgba(253,224,71,0.5)]"
                />
            </div>
            <p className="text-[10px] text-brand-200 mt-2 text-right">
                {completedItemsCount}/{totalItemsCount} steps completed
            </p>
        </div>

        {/* Badges/Stats - Simplified for now */}
        <div className="hidden md:flex gap-3">
             <div className="flex flex-col items-center bg-white/10 rounded-xl p-2 min-w-[70px] border border-white/10">
                 <Star size={16} className="text-yellow-300 mb-1" />
                 <span className="text-[10px] font-bold">{earnedBadges.length}</span>
                 <span className="text-[9px] text-brand-200">Badges</span>
             </div>
             <div className="flex flex-col items-center bg-white/10 rounded-xl p-2 min-w-[70px] border border-white/10">
                 <TrendingUp size={16} className="text-emerald-300 mb-1" />
                 <span className="text-[10px] font-bold">Top 5%</span>
                 <span className="text-[9px] text-brand-200">Host Rank</span>
             </div>
        </div>

      </div>
    </div>
  );
};
