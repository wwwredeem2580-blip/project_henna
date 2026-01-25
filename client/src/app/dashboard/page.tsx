'use client';

import { Dashboard } from '@/components/host/dashboard/Dashboard';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/lib/context/notification';
import { useEffect } from 'react';
import { authService } from '@/lib/api/auth';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  
  const login = searchParams.get('login');
  const registered = searchParams.get('registered');

  useEffect(() => {
    if (login === 'success') {
      showNotification('success', 'Welcome back!', 'Successfully logged in');
      router.replace('/dashboard');
    }
    if (registered === 'true') {
      showNotification('success', 'Registration Successful!', 'Welcome to Zenny! Please check your email to verify your account.');
      router.replace('/dashboard');
    }
  }, [login, registered, router, showNotification]);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/onboarding');
  };

  return <Dashboard onLogout={handleLogout} />;
}
