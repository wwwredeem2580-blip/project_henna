'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LearnHeroProps {
  title: string;
  subtitle: string;
  category: string;
  lastUpdated?: string;
}

export const LearnHero: React.FC<LearnHeroProps> = ({ title, subtitle, category, lastUpdated }) => {
  return (
    <div className="space-y-6 mb-12 border-b border-neutral-100 pb-12">
      {/* <Link href="/learn/how-zenvy-protects-buyers" className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-brand-600 transition-colors mb-4 group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Guides
      </Link> */}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[9px] font-bold uppercase tracking-widest border border-brand-100">
          {category}
        </span>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-neutral-900 leading-[1.2] tracking-tight">
          {title}
        </h1>
        <p className="text-md text-neutral-500 font-light leading-relaxed">
          {subtitle}
        </p>
        
        {lastUpdated && (
           <p className="text-xs text-neutral-400 pt-4">Last updated: {lastUpdated}</p>
        )}
      </motion.div>
    </div>
  );
};
