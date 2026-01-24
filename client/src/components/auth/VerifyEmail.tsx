'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface VerifyEmailProps {
  onVerified: () => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ onVerified }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[500px] w-full space-y-8"
      >
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-brand-500 rounded-full blur-2xl"
            />
            <div className="relative w-24 h-24 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-100">
              <Mail size={48} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Verify your email</h1>
          <p className="text-gray-500 text-lg font-[300]">
            We've sent a magic link to your inbox. Please click it to confirm your account.
          </p>
        </div>

        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
          <p className="text-sm text-neutral-400 font-[300]">Didn't receive anything?</p>
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-center gap-2 text-brand-600 font-[500] hover:text-brand-700 transition-colors">
              <RefreshCw size={18} />
              Resend verification email
            </button>
            <button className="text-neutral-400 text-xs hover:text-neutral-600 transition-colors">Change email address</button>
          </div>
        </div>

        <button
          onClick={onVerified}
          className="w-full bg-neutral-800 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group"
        >
          Check Verification Status
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-center gap-2 text-neutral-400">
          <CheckCircle size={16} />
          <span className="text-sm font-[300]">Link expires in 24 hours</span>
        </div>
      </motion.div>
    </div>
  );
};
