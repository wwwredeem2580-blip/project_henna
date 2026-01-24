'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ChevronLeft, Sparkles, Building2, Phone, ShieldCheck, ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import { authService } from '@/lib/api/auth';
import { useNotification } from '@/lib/context/notification';
import { businessInfoSchema, companyDetailsSchema, personalInfoSchema } from '@/schema/auth.schema';

interface RegisterProps {
  onSuccess: () => void;
  onGoBack: () => void;
}

type Step = 'org' | 'verify' | 'basic';

interface FormData {
  // Step 1: Business Info
  businessName: string;
  businessEmail: string;
  phoneNumber: string;
  website: string;
  
  // Step 2: Company Details
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  
  // Step 3: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onGoBack }) => {
  const { showNotification } = useNotification();
  const [step, setStep] = useState<Step>('org');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessEmail: '',
    phoneNumber: '',
    website: '',
    companySize: '1-10',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (currentStep: Step): boolean => {
    try {
      if (currentStep === 'org') {
        businessInfoSchema.parse({
          businessName: formData.businessName,
          businessEmail: formData.businessEmail,
          phoneNumber: formData.phoneNumber,
        });
      } else if (currentStep === 'verify') {
        companyDetailsSchema.parse({
          companySize: formData.companySize,
          website: formData.website,
        });
      } else if (currentStep === 'basic') {
        personalInfoSchema.parse({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
      }
      
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = (nextStep: Step) => {
    if (validateStep(step)) {
      setStep(nextStep);
    }
  };

  const handleBack = () => {
    if (step === 'org') {
      onGoBack();
    } else if (step === 'verify') {
      setStep('org');
    } else {
      setStep('verify');
    }
  };

  // Manual registration
  const handleManualRegister = async () => {
    if (!validateStep('basic')) return;

    setLoading(true);
    try {
      await authService.register(formData);
      showNotification('success', 'Success!', 'Account created successfully');
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed';
      showNotification('error', 'Error', message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth registration
  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const { url } = await authService.initiateGoogleRegister({
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        phoneNumber: formData.phoneNumber,
        website: formData.website,
        companySize: formData.companySize,
      });

      // Redirect to Google OAuth
      window.location.href = url;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to initiate Google registration';
      showNotification('error', 'Error', message);
      setLoading(false);
    }
  };

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
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group font-[400]"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            {step === 'org' ? 'Back' : 'Previous Step'}
          </button>

          <div className="flex gap-2">
            {(['org', 'verify', 'basic'] as Step[]).map((s) => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === s ? 'bg-brand-500' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Business Information */}
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

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Business Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    placeholder="Zenny Studios"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-brand-600 focus:bg-white outline-none transition-all"
                  />
                </div>
                {errors.businessName && <p className="text-xs text-red-500 ml-1">{errors.businessName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Business Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => updateField('businessEmail', e.target.value)}
                    placeholder="contact@zenny.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-brand-600 focus:bg-white outline-none transition-all"
                  />
                </div>
                {errors.businessEmail && <p className="text-xs text-red-500 ml-1">{errors.businessEmail}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-brand-600 focus:bg-white outline-none transition-all"
                  />
                </div>
                {errors.phoneNumber && <p className="text-xs text-red-500 ml-1">{errors.phoneNumber}</p>}
              </div>

              <button
                onClick={() => handleNext('verify')}
                className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Next: Company Details
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Company Details */}
          {step === 'verify' && (
            <motion.div key="verify" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 2: Company Details</span>
                </div>
                <h2 className="text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Additional Information</h2>
                <p className="text-gray-500 font-[300]">Tell us about your company size</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Company Size *</label>
                <div className="grid grid-cols-3 gap-2">
                  {companySizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateField('companySize', size)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        formData.companySize === size
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {errors.companySize && <p className="text-xs text-red-500 ml-1">{errors.companySize}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Website (Optional)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://zenny.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-brand-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => handleNext('basic')}
                className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Next: Account Setup
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 3: Personal Info (Manual OR Google) */}
          {step === 'basic' && (
            <motion.div key="basic" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-brand-500" size={20} strokeWidth={1} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 3: Account Setup</span>
                </div>
                <h1 className="text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Your Account Details</h1>
                <p className="text-gray-500 font-[300]">Choose how you'd like to sign up</p>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-neutral-200 rounded-xl hover:bg-gray-50 transition-all font-[500] text-neutral-700 disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                {loading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or sign up manually</span>
                </div>
              </div>

              {/* Manual Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Confirm *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <button
                onClick={handleManualRegister}
                disabled={loading}
                className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <CheckCircle2 size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
