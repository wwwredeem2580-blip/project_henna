'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { VerifyEmail } from '@/components/auth/VerifyEmail';
import { useAuth } from '@/lib/context/auth';
import { authService } from '@/lib/api/auth';
import { useNotification } from '@/lib/context/notification';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isHost } = useAuth();
  const token = searchParams.get('token');

  
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { showNotification } = useNotification();


  // If token is in URL, show stateless verification page
  useEffect(() => {
    if (token && status === 'idle') {
      setStatus('loading');
      setVerifying(true);
      
      // Call verification endpoint (stateless)
      const verifyEmail = async () => {
        try {
          const response = await authService.verifyEmail(token);

          if (response.success) {
            setStatus('success');
            showNotification(
              'success',
              'Email Verification',
              response.message || 'Email verified successfully!',
            );
          } else {
            setStatus('error');
            showNotification(
              'error',
              'Email Verification',
              response.message || 'Verification failed',
            );
          }
        } catch (error: any) {
          console.log(error);
          setStatus('error');
          showNotification(
            'error',
            'Email Verification',
            error.message || 'Failed to verify email. Please try again.',
          );
        }
      };

      verifyEmail();
    }
  }, [token, status]);

  // If user is already verified, redirect to appropriate page
  useEffect(() => {
    if (user?.emailVerified && !token) {
      if (isHost) {
        router.push('/host/dashboard');
      } else {
        router.push('/events');
      }
    }
  }, [user, isHost, router, token]);

  const handleVerificationSuccess = () => {
    // Redirect based on role
    if (isHost) {
      router.push('/host/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  // If token is present, show stateless verification result page
  if (token) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] -z-10 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[80px] -z-10 opacity-50" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[500px] bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-100/50 text-center"
        >
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 mx-auto text-brand-500 animate-spin" />
              <h1 className="text-2xl font-[300] text-gray-900">Verifying your email...</h1>
              <p className="text-gray-500 font-[300]">Please wait a moment</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-green-500" size={48} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-[300] text-gray-900">Email Verified!</h1>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                <p className="text-sm text-green-700 font-[400]">
                  ✓ Your email has been successfully verified. You can now close this page and return to the app.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="text-red-500" size={48} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-[300] text-gray-900">Verification Failed</h1>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                <p className="text-sm text-red-700 font-[400]">
                  ✗ The verification link may be invalid or expired. Please request a new verification email from the app.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Otherwise, show the verify email component for logged-in users
  return (
    <VerifyEmail 
      onSuccess={handleVerificationSuccess} 
      onGoBack={handleGoBack}
    />
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
