'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { VerifyEmail } from '@/components/auth/VerifyEmail';
import { useAuth } from '@/lib/context/auth';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isHost } = useAuth();
  const token = searchParams.get('token');

  // If user is already verified, redirect to appropriate page
  useEffect(() => {
    if (user?.emailVerified) {
      if (isHost) {
        router.push('/host/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, isHost, router]);

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

  return (
    <VerifyEmail 
      onSuccess={handleVerificationSuccess} 
      onGoBack={handleGoBack}
      token={token || undefined}
    />
  );
}
