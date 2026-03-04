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
          // Call dedicated check endpoint
          const status = await authService.checkVerificationStatus();
          
          // If user is now verified, refresh token and show success
          if (status.verified) {
            // Refresh token to get updated emailVerified claim
            await authService.refresh();
            await refreshAuth();
            
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
  }, [verified, verifying, onSuccess, showNotification]);

  const handleVerifyWithToken = async (verificationToken: string) => {
    setVerifying(true);
    try {
      await authService.verifyEmail(verificationToken);
      setVerified(true);
      showNotification('success', 'Email Verified!', 'Your email has been successfully verified');
      
      // Refresh token to get updated emailVerified claim
      await authService.refresh();
      await refreshAuth();
      
      // Redirect after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      const message = error?.message || 'Verification failed';
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
      // Call dedicated check endpoint
      const status = await authService.checkVerificationStatus();
      
      // Check if now verified
      if (status.verified) {
        // Refresh token to get updated emailVerified claim
        await authService.refresh();
        await refreshAuth();
        
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Sharp grid background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#9333ea_1px,_transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[500px] bg-white p-8 md:p-12 border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-center relative z-10"
      >
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group font-[400] mb-8"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-wix-purple/10 border-2 border-wix-purple flex items-center justify-center mx-auto mb-6">
            <Mail className="text-wix-purple" size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-[300] text-gray-900 mb-4 leading-tight">Check your email</h1>
            <p className="text-gray-500 text-sm sm:text-base font-[300] mb-8">
              We've sent a verification link to <br/>
              <span className="font-medium text-wix-purple">{user?.email}</span>
            </p>
          </div>

          <div className="bg-wix-purple/5 border border-wix-purple/20 p-4 text-left space-y-2">
            <p className="text-sm text-wix-purple font-[500]">📧 Check your inbox</p>
            <p className="text-sm text-gray-600">Click the verification link in the email to activate your account.</p>
          </div>

          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full bg-black text-white font-[600] py-3 sm:py-4 flex items-center justify-center gap-2 hover:bg-neutral-800 border-2 border-black transition-all disabled:opacity-50"
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
            className="w-full bg-white border-2 border-black text-black font-[600] py-3 sm:py-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                await authService.logout();
                showNotification('info', 'Logged Out', 'You can now sign up or log in with a different email');
                window.location.href = '/';
              } catch (error) {
                showNotification('error', 'Error', 'Failed to logout');
              }
            }}
            className="w-full bg-white border-2 border-black text-black font-[600] py-3 sm:py-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            Use Different Email
          </button>

          <p className="text-xs text-gray-400">
            Didn't receive the email? Check your spam folder or click resend.
            <br />
            <span className="text-wix-purple font-medium">Auto-checking every 5 seconds...</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
