'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Login } from '@/components/auth/Login';
import { SignupHost } from '@/components/auth/SignupHost';
import { SignupUser } from '@/components/auth/SignupUser';
import { useEffect } from 'react';
import { useNotification } from '@/lib/context/notification';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const tab = searchParams.get('tab') || 'login';
  const role = searchParams.get('role') || 'user';
  const error = searchParams.get('error');
  const email = searchParams.get('email');

  // Show error notification if present
  useEffect(() => {
    if (error) {
      showNotification('error', 'Authentication Error', decodeURIComponent(error));
      // Clean up URL
      const newUrl = `/auth?tab=${tab}${email ? `&email=${email}` : ''}`;
      router.replace(newUrl);
    }
  }, [error, tab, email, router, showNotification]);

  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  const handleRegisterSuccess = () => {
    showNotification('success', 'Registration Successful!', 'Please check your email to verify your account');
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.push('/');
  };

  const handleSwitchToRegister = () => {
    router.push(`/auth?tab=signup&role=${role}`);
  };

  const handleSwitchToLogin = () => {
    router.push(`/auth?tab=login&role=${role}`);
  };

  if (tab === 'signup' && role === 'host') {
    return <SignupHost onSuccess={handleRegisterSuccess} onGoBack={handleGoBack} />;
  }

  if (tab === 'signup' && role === 'user') {
    return <SignupUser onSuccess={handleRegisterSuccess} onGoBack={handleGoBack} />;
  }

  return <Login onLogin={handleLoginSuccess} onGoBack={handleGoBack} />;
}
