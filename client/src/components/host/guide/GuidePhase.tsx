'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface GuideItem {
  id: string;
  label: string;
  description?: string;
  isCritical?: boolean;
  isUpcoming?: boolean;
  expandedContent?: React.ReactNode;
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItemExpansion = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

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
        className="p-4 md:p-6 cursor-pointer flex items-start gap-3 md:gap-4"
      >
        <div className={`
          w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm shrink-0 transition-colors
          ${isComplete ? 'bg-green-500 text-white' : 'bg-neutral-100 text-neutral-500'}
        `}>
          {isComplete ? <CheckCircle2 size={16} className="md:w-5 md:h-5" /> : phaseNumber}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className={`font-semibold text-base md:text-lg ${isComplete ? 'text-green-800' : 'text-neutral-800'}`}>
              {title}
            </h3>
            {isExpanded ? <ChevronUp size={20} className="text-neutral-400 shrink-0" /> : <ChevronDown size={20} className="text-neutral-400 shrink-0" />}
          </div>
          <p className="text-xs md:text-sm text-neutral-500 mb-3 leading-relaxed">{description}</p>
          
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
            <div className="px-3 pb-4 md:px-6 md:pb-6 pt-0 md:pl-[4.5rem]">
              <div className="space-y-3 md:space-y-4">
                {items.map((item) => {
                  const isChecked = completedItems.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={(e) => toggleItemExpansion(item.id, e)}
                      className={`
                        group flex flex-col p-3 rounded-xl cursor-pointer transition-all border
                        ${isChecked 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-neutral-100 hover:border-brand-200 hover:shadow-sm'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                            onClick={(e) => { e.stopPropagation(); onToggleItem(item.id); }}
                            className={`mt-0.5 shrink-0 transition-colors ${isChecked ? 'text-green-500' : 'text-neutral-300 group-hover:text-brand-400'}`}
                        >
                            {isChecked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium break-words ${isChecked ? 'text-green-800 line-through decoration-green-800/30' : 'text-neutral-700'}`}>
                            {item.label}
                            </p>
                            {item.description && (
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                {item.description}
                            </p>
                            )}
                            {item.isCritical && !isChecked && (
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] md:text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
                                    <AlertCircle size={12} />
                                    CRITICAL STEP
                                </div>
                            )}
                            {item.isUpcoming && (
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] md:text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-md w-fit">
                                    COMING SOON
                                </div>
                            )}
                        </div>
                        {item.expandedContent && (
                             <div className="text-neutral-400 shrink-0">
                                {expandedItems.includes(item.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                             </div>
                        )}
                      </div>

                      {/* Expanded Content Area */}
                      <AnimatePresence>
                        {item.expandedContent && expandedItems.includes(item.id) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden md:pl-8"
                            >
                                <div className="pt-2 border-t border-dashed border-neutral-200/60 w-full" onClick={(e) => e.stopPropagation()}>
                                    {item.expandedContent}
                                </div>
                            </motion.div>
                        )}
                      </AnimatePresence>
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
