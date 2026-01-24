'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ChevronLeft, Sparkles, UserPlus } from 'lucide-react';

interface SignupUserProps {
  onSuccess: () => void;
  onGoBack: () => void;
}

export const SignupUser: React.FC<SignupUserProps> = ({ onSuccess, onGoBack }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] space-y-8"
      >
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-brand-500" size={24} strokeWidth={1} />
            <span className="text-sm font-[500] uppercase tracking-widest text-brand-500">User Account</span>
          </div>
          <h1 className="text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Create your profile</h1>
          <p className="text-gray-500 font-[300]">Discover and join the world's most elegant events.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-[500] text-neutral-700 ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input type="text" placeholder="John" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-[500] text-neutral-700 ml-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input type="text" placeholder="Doe" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-[500] text-neutral-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input type="email" placeholder="john@example.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-[500] text-neutral-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input type="password" placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-[500] text-neutral-700 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input type="password" placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
            </div>
          </div>

          <button
            onClick={onSuccess}
            className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
          >
            Create Account
            <UserPlus size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
