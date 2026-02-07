'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface GuideItem {
  id: string;
  label: string;
  description?: string;
  isCritical?: boolean;
}

interface GuidePhaseProps {
  title: string;
  description: string;
  phaseNumber: number;
  items: GuideItem[];
  completedItems: string[];
  onToggleItem: (itemId: string) => void;
  isLocked?: boolean;
}

export const GuidePhase: React.FC<GuidePhaseProps> = ({
  title,
  description,
  phaseNumber,
  items,
  completedItems,
  onToggleItem,
  isLocked = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!isLocked && phaseNumber === 1);

  const completedCount = items.filter(item => completedItems.includes(item.id)).length;
  const progress = (completedCount / items.length) * 100;
  const isComplete = progress === 100;

  return (
    <div className={`mb-6 border rounded-2xl transition-all duration-300 ${
      isComplete ? 'bg-green-50/50 border-green-200' : 'bg-white border-neutral-200'
    } ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
      
      {/* Header */}
      <div 
        onClick={() => !isLocked && setIsExpanded(!isExpanded)}
        className="p-6 cursor-pointer flex items-start gap-4"
      >
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors
          ${isComplete ? 'bg-green-500 text-white' : 'bg-neutral-100 text-neutral-500'}
        `}>
          {isComplete ? <CheckCircle2 size={20} /> : phaseNumber}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className={`font-semibold text-lg ${isComplete ? 'text-green-800' : 'text-neutral-800'}`}>
              {title}
            </h3>
            {isExpanded ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
          </div>
          <p className="text-sm text-neutral-500 mb-3">{description}</p>
          
          {/* Progress Bar in Header (Visible when collapsed or expanded) */}
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-brand-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 pl-[4.5rem]">
              <div className="space-y-4">
                {items.map((item) => {
                  const isChecked = completedItems.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => onToggleItem(item.id)}
                      className={`
                        group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border
                        ${isChecked 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-neutral-100 hover:border-brand-200 hover:shadow-sm'}
                      `}
                    >
                      <div className={`mt-0.5 shrink-0 transition-colors ${isChecked ? 'text-green-500' : 'text-neutral-300 group-hover:text-brand-400'}`}>
                        {isChecked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isChecked ? 'text-green-800 line-through decoration-green-800/30' : 'text-neutral-700'}`}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        {item.isCritical && !isChecked && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
                                <AlertCircle size={12} />
                                CRITICAL STEP
                            </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
