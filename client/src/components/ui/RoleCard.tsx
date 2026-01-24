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
        "relative cursor-pointer p-6 rounded-[1.5rem] border-2 transition-all duration-300",
        selected
          ? "border-brand-500 bg-brand-50 shadow-xl shadow-brand-100/50"
          : "border-brand-200 bg-white hover:border-brand-300 hover:shadow-xl hover:shadow-brand-50"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          selected ? "bg-brand-500 text-white shadow-lg shadow-brand-200" : "bg-brand-100 text-brand-400"
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={cn(
            "text-lg font-[400] tracking-tight transition-colors",
            selected ? "text-slate-950" : "text-slate-950"
          )}>
            {title}
          </h3>
          <p className="text-sm text-slate-500 font-[300]">
            {description}
          </p>
        </div>
        <div className="ml-2">
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-purple-600"
            >
              <CheckCircle2 size={24} fill="currentColor" className="text-white fill-purple-600" />
            </motion.div>
          )}
        </div>
      </div>

      {selected && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 rounded-[1.5rem] ring-4 ring-purple-500/5 blur-sm -z-10"
        />
      )}
    </motion.div>
  );
};
