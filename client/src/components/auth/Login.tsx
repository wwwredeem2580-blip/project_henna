'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ChevronLeft, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onGoBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onGoBack }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Left: Login Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col justify-center items-center p-8 lg:p-20 order-2 lg:order-1"
      >
        <div className="w-full max-w-[500px] p-8 space-y-8">
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 text-neutral-500 hover:text-gray-900 transition-colors group font-[500]"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to onboarding
          </button>

          <div className="space-y-2">
            <h1 className="text-4xl font-[300] text-neutral-800 tracking-tight">Welcome Back</h1>
            <p className="text-neutral-500 font-[300]">Log in to manage your events and tickets with ease.</p>
          </div>

          <div className="space-y-6">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-1 border-neutral-100 rounded-xl hover:bg-gray-50 transition-all font-[300] text-neutral-700">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>

            <div className="flex items-center gap-4 text-neutral-200">
              <div className="h-px flex-1 bg-neutral-100" />
              <span className="text-xs font-[500] uppercase tracking-widest text-neutral-400">or email</span>
              <div className="h-px flex-1 bg-neutral-100" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Password</label>
                  <button className="text-sm font-[500] text-neutral-700 hover:text-neutral-600">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={onLogin}
              className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-700 transition-all shadow-lg shadow-neutral-100"
            >
              Sign In
              <LogIn size={20} />
            </button>
          </div>

          <p className="text-center text-neutral-500 font-[400]">
            Don't have an account? <button className="text-brand-500 font-[500] hover:underline">Create one</button>
          </p>
        </div>
      </motion.div>

      {/* Right: Brand Showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 bg-brand-500 hidden md:block relative overflow-hidden flex flex-col justify-center items-center p-12 order-1 lg:order-2"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
        </div>

        {/* Animated Background Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-400 blur-[120px] rounded-full opacity-40"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-300 blur-[100px] rounded-full opacity-30"
        />

        <div className="relative z-10 flex flex-col items-center justify-center h-[80vh] text-center space-y-8">
          <div className='max-w-[500px] flex flex-col items-center gap-4'>
            <div className="inline-flex max-w-[400px] items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white">
              <Sparkles size={18} />
              <span className="text-sm font-[500] uppercase tracking-wider">Experience the Future</span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">
              Elevate your <br />
              <span className="text-brand-200">Experiences.</span>
            </h2>

              <p className="text-white/80 text-lg font-[300] leading-relaxed">
                Join thousands of event architects creating unfathomably clean moments for their community.
              </p>

              <div className="flex justify-center -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/${i + 20}/100/100`}
                    className="w-16 h-16 rounded-full border-4 border-purple-600 shadow-xl"
                    alt="user"
                  />
                ))}
                <div className="w-16 h-16 rounded-full border-4 border-purple-600 bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-xl">
                  +10k
                </div>
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
