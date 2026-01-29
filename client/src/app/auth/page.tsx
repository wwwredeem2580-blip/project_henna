'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Login } from '@/components/auth/Login';
import { SignupUser } from '@/components/auth/SignupUser';
import { SignupHost } from '@/components/auth/SignupHost';
import { useEffect } from 'react';
import { useNotification } from '@/lib/context/notification';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const tab = searchParams.get('tab') || 'login';
  const role = searchParams.get('role') as 'host' | 'user' | null;
  const error = searchParams.get('error');
  const email = searchParams.get('email');

  // Show error notification if present
  useEffect(() => {
    if (error) {
      showNotification('error', 'Authentication Error', decodeURIComponent(error));
      // Clean up URL
      const newUrl = `/auth?tab=${tab}${role ? `&role=${role}` : ''}${email ? `&email=${email}` : ''}`;
      router.replace(newUrl);
    }
  }, [error, tab, role, email, router, showNotification]);

  const handleLoginSuccess = () => {
    // Redirect will be handled by backend based on role
    router.push('/dashboard');
  };

  const handleRegisterSuccess = () => {
    showNotification('success', 'Registration Successful!', 'Please check your email to verify your account');
    // Redirect will be handled by backend based on role
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.push('/onboarding');
  };

  // Registration flow - route based on role
  if (tab === 'signup' || tab === 'register') {
    if (role === 'user') {
      return <SignupUser onSuccess={handleRegisterSuccess} onGoBack={handleGoBack} />;
    }
    // Default to host registration (or if role === 'host')
    return <SignupHost onSuccess={handleRegisterSuccess} onGoBack={handleGoBack} />;
  }

  // Login flow
  return <Login onLogin={handleLoginSuccess} onGoBack={handleGoBack} />;
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white"><div className="text-brand-600">Loading...</div></div>}>
      <AuthContent />
    </Suspense>
  );
}
