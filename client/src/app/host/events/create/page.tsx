'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useNotification } from '@/lib/context/notification';
import { CreateEvent } from '@/components/host/events/create/CreateEvent';

function CreateEventContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleGoBack = () => {
    router.back();
  };

  const onSuccess = () => {
    router.push('/dashboard');
  };

  return <CreateEvent onGoBack={handleGoBack} onSuccess={onSuccess} />;
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-brand-600">Loading...</div></div>}>
      <CreateEventContent />
    </Suspense>
  );
}
