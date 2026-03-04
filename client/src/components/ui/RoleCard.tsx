import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ title, description, icon, selected, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer p-4 sm:p-6 border-2 transition-all duration-300",
        selected
          ? "border-wix-purple bg-wix-purple/5"
          : "border-wix-border-light bg-white hover:border-black"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center transition-all duration-300 border border-transparent",
          selected ? "bg-wix-purple text-white border-wix-purple" : "bg-gray-100 text-gray-500 border-wix-border-light"
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={cn(
            "text-md sm:text-lg font-[400] tracking-tight transition-colors",
            selected ? "text-slate-950" : "text-slate-950"
          )}>
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-[300]">
            {description}
          </p>
        </div>
        <div className="ml-2 sm:block hidden">
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-purple-600"
            >
              <CheckCircle2 size={24} fill="currentColor" className="text-white fill-wix-purple" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
