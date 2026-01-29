'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/lib/context/notification';
import { useEffect } from 'react';
import { publicService } from '@/lib/api/public';
import Events from '@/components/events/Events';

function EventsContent() {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    
  }, [router]);

  return <Events />;
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-brand-600">Loading...</div></div>}>
      <EventsContent />
    </Suspense>
  );
}
