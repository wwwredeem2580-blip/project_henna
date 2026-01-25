'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, RefreshCw, ChevronLeft } from 'lucide-react';
import { authService } from '@/lib/api/auth';
import { useNotification } from '@/lib/context/notification';
import { useAuth } from '@/lib/context/auth';

interface VerifyEmailProps {
  onSuccess: () => void;
  onGoBack: () => void;
  token?: string;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ onSuccess, onGoBack, token }) => {
  const { showNotification } = useNotification();
  const { user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = async () => {
    await authService.refresh();
  };
  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && !verified) {
      handleVerifyWithToken(token);
    }
  }, [token]);

  // Periodic polling to check if email was verified (e.g., on another device)
  useEffect(() => {
    if (!verified && !verifying) {
      const interval = setInterval(async () => {
        try {
          // Refresh auth to get latest user data
          await refreshAuth();
          // If user is now verified, show success
          if (user?.emailVerified) {
            setVerified(true);
            showNotification('success', 'Email Verified!', 'Your email has been successfully verified');
            setTimeout(() => {
              onSuccess();
            }, 1500);
          }
        } catch (error) {
          // Silently fail - user might have logged out
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [verified, verifying, user, refreshAuth, onSuccess, showNotification]);

  const handleVerifyWithToken = async (verificationToken: string) => {
    setVerifying(true);
    try {
      await authService.verifyEmail(verificationToken);
      setVerified(true);
      showNotification('success', 'Email Verified!', 'Your email has been successfully verified');
      
      // Refresh auth to get updated user data
      await refreshAuth();
      await refreshToken()
      
      // Redirect after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Verification failed';
      showNotification('error', 'Verification Failed', message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await authService.resendVerification();
      showNotification('success', 'Email Sent!', 'Verification email has been resent. Please check your inbox.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to resend email';
      showNotification('error', 'Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      // Refresh auth to get latest token with updated emailVerified status
      await refreshAuth();
      
      // Check if now verified
      if (user?.emailVerified) {
        setVerified(true);
        showNotification('success', 'Email Verified!', 'Your email has been successfully verified');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        showNotification('info', 'Not Verified Yet', 'Please check your email and click the verification link');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to check status';
      showNotification('error', 'Error', message);
    } finally {
      setChecking(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-2xl font-[300] text-gray-900">Verifying your email...</h2>
        </motion.div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-[300] text-gray-900">Email Verified!</h2>
          <p className="text-gray-500">Redirecting you to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] -z-10 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[80px] -z-10 opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-100/50"
      >
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group font-[400] mb-8"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="space-y-6 text-center">
          <div className="w-20 h-20 mx-auto bg-brand-50 rounded-full flex items-center justify-center">
            <Mail className="text-brand-500" size={40} />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-[300] text-gray-900 tracking-tight">Verify Your Email</h1>
            <p className="text-gray-500 font-[300]">
              We've sent a verification link to <span className="font-[500] text-gray-700">{user?.email}</span>
            </p>
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm text-brand-700 font-[500]">📧 Check your inbox</p>
            <p className="text-sm text-gray-600">Click the verification link in the email to activate your account.</p>
          </div>

          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
          >
            {checking ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                I've Verified - Check Status
              </>
            )}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                Resend Verification Email
              </>
            )}
          </button>

          <p className="text-xs text-gray-400">
            Didn't receive the email? Check your spam folder or click resend.
            <br />
            <span className="text-brand-500">Auto-checking every 5 seconds...</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
