'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ChevronLeft, Sparkles, Building2, Phone, ShieldCheck, Upload, ArrowRight, CheckCircle2, Globe } from 'lucide-react';

interface RegisterProps {
  onSuccess: () => void;
  onGoBack: () => void;
}

type Step = 'basic' | 'org' | 'verify';

export const Register: React.FC<RegisterProps> = ({ onSuccess, onGoBack }) => {
  const [step, setStep] = useState<Step>('org');
  const [identity, setIdentity] = useState<string>('');

  const identities = ['Organizer', 'Venue Owner', 'Representative', 'Artist', 'Performer'];
  const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] -z-10 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[80px] -z-10 opacity-50" />

      <motion.div
        layout
        className="w-full max-w-[500px] bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-100/50"
      >
        <div className="mb-12 flex justify-between items-center">
          <button
            onClick={() => step === 'org' ? onGoBack() : setStep(step === 'basic' ? 'verify' : 'org')}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group font-[400]"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            {step === 'org' ? 'Back' : 'Previous Step'}
          </button>

          <div className="flex gap-2">
            {(['basic', 'org', 'verify'] as Step[]).map((s, i) => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === s ? 'bg-brand-500' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'org' && (
            <motion.div key="org" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 1: Organization</span>
                </div>
                <h2 className="text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Business Information</h2>
                <p className="text-gray-500 font-[300]">How should we identify your brand?</p>
              </div>

              {/* <div className="space-y-4">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Brand Identity</label>
                <div className="flex flex-wrap gap-2">
                  {identities.map((id) => (
                    <button
                      key={id}
                      onClick={() => setIdentity(id)}
                      className={`px-4 py-2 rounded-full text-sm font-[500] border-2 transition-all ${
                        identity === id ? 'bg-brand-500 border-brand-500 text-white' : 'bg-gray-50 border-transparent text-gray-500 hover:border-brand-200'
                      }`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div> */}

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Zenny Studios" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-brand-600 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" placeholder="zenny@studio.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-brand-600 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" placeholder="+1 (555) 000-0000" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-brand-600 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                // disabled={!identity}
                className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all disabled:opacity-50 shadow-lg shadow-brand-100"
              >
                Next: Additional
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div key="verify" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 2: Additional</span>
                </div>
                <h2 className="text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Additional Information</h2>
                <p className="text-gray-500 font-[300]">Additional Details about your Business.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Company Size *</label>
                <div className="grid grid-cols-3 gap-2">
                  {companySizes.map((size) => (
                    <button
                      key={size}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        true
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Website (Optional)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="https://zennystudios.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-brand-600 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 flex items-start gap-3">
                <div className="mt-0.5"><CheckCircle2 size={16} className="text-brand-600" /></div>
                <p className="text-xs text-brand-800 font-[400] leading-relaxed">
                  By clicking Next, you agree to our verification process. We will also send a verification link to your email.
                </p>
              </div>

              <button
                onClick={() => setStep('basic')}
                className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Next: Identity
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
          {step === 'basic' && (
            <motion.div key="basic" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-brand-500" size={20} strokeWidth={1} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 3: Identity</span>
                </div>
                <h1 className="text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Your basic details</h1>
                <p className="text-gray-500 font-[300]">Start by telling us who you are.</p>
              </div>
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-1 border-neutral-100 rounded-xl hover:bg-gray-50 transition-all font-[300] text-neutral-700">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Auto Fill with Google
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">First Name</label>
                  <input type="text" placeholder='John' className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Last Name</label>
                  <input type="text" placeholder='Doe' className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Email Address</label>
                <input type="email" placeholder='john@example.com' className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Password</label>
                  <input type="password" placeholder='********' className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Confirm</label>
                  <input type="password" placeholder='********' className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <button
                onClick={onSuccess}
                className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Complete Registration
                <CheckCircle2 size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
