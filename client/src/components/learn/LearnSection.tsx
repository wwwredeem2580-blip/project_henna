'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LearnSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const LearnSection: React.FC<LearnSectionProps> = ({ title, children, className = '' }) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`mb-16 ${className}`}
    >
      {title && (
        <h2 className="text-2xl font-light text-neutral-900 mb-6 tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
            {title}
        </h2>
      )}
      <div className="prose prose-neutral prose-p:font-light prose-p:text-neutral-600 prose-headings:font-light prose-strong:font-medium prose-strong:text-neutral-900">
        {children}
      </div>
    </motion.section>
  );
};
