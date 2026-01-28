'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useNotification } from '@/lib/context/notification';
import { CreateEvent } from '@/components/host/events/create/CreateEvent';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  const onSuccess = () => {
    router.push('/dashboard');
  };

  return <CreateEvent onGoBack={handleGoBack} onSuccess={onSuccess} />;
}
