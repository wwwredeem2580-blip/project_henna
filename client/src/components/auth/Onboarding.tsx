'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { RoleCard } from '../ui/RoleCard';
import { Calendar, Ticket, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';

interface OnboardingProps {
  onContinue: (role: UserRole) => void;
  onLogin: () => void;
}

import { Logo } from '../shared/Logo';

export const Onboarding: React.FC<OnboardingProps> = ({ onContinue, onLogin }) => {
  const [role, setRole] = useState<UserRole | null>(null);

  // Added explicit Variants type to fix ease string assignment error
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.6 } }
  };

  // Added explicit Variants type to fix ease string assignment error
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col justify-center items-center p-8 lg:p-20 z-10"
      >
        <div className="w-full max-w-[400px] space-y-8">
          <motion.div variants={itemVariants} className="flex items-center gap-2.5 mb-8 group cursor-pointer">
            <Logo variant='full' className="text-neutral-950 max-w-[150px]" />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <h1 className="text-3xl font-[300] tracking-tight text-slate-950 lg:text-5xl">
              Start your journey
            </h1>
            <p className="text-slate-500 text-lg font-[300] leading-[1]">
              Experience events in a way you've never imagined. Choose your path to continue.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <RoleCard
              title="I am a Host"
              description="Organize hybrid events and grow your audience."
              icon={<Calendar size={24} />}
              selected={role === 'host'}
              onClick={() => setRole('host')}
            />
            <RoleCard
              title="I am a User"
              description="Discover and attend unique global experiences."
              icon={<Ticket size={24} />}
              selected={role === 'user'}
              onClick={() => setRole('user')}
            />
          </motion.div>

          <motion.button
            variants={itemVariants}
            disabled={!role}
            onClick={() => role && onContinue(role)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-slate-950 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-slate-200/50"
          >
            Get Started
            <ArrowRight size={20} />
          </motion.button>

          <motion.p variants={itemVariants} className="text-center text-slate-400 font-bold text-sm">
            Already have an account? <button onClick={onLogin} className="text-purple-600 hover:underline transition-colors">Sign In</button>
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:flex flex-1 bg-purple-50 relative overflow-hidden items-center justify-center p-12"
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100 blur-[120px]" />
        </div>

        <div className="w-full max-w-[500px] bg-white rounded-[3.5rem] border border-purple-200 shadow-4xl p-10 space-y-8 relative z-10">
          <div className="flex items-center justify-between border-b border-purple-200 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-50" />
              <div className="space-y-1.5">
                <div className="h-3 w-32 bg-brand-50 rounded-full" />
                <div className="h-2 w-20 bg-brand-50 rounded-full" />
              </div>
            </div>
            <div className="h-10 w-10 bg-brand-50 rounded-xl" />
          </div>

          <div className="space-y-4">
            <div className="h-12 w-4/5 bg-brand-50 rounded-2xl" />
            <div className="h-4 w-3/5 bg-brand-50 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="aspect-video bg-brand-50 rounded-[2rem] border-2 border-dashed border-brand-200 flex items-center justify-center">
              <Calendar className="text-brand-200" size={40} />
            </div>
            <div className="aspect-video bg-brand-50 rounded-[2rem] border border-brand-200 flex items-center justify-center">
              <Ticket className="text-brand-300" size={40} />
            </div>
          </div>

          <div className="p-8 bg-brand-400 rounded-[2.5rem] text-white space-y-3 shadow-3xl shadow-brand-500/30">
            <h3 className="font-[400] text-2xl tracking-tight leading-none text-white">Human-led, AI-powered</h3>
            <p className="text-white/80 leading-[1] font-[300]">Built with Hostinger-level precision. Every pixel optimized for your event success.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
