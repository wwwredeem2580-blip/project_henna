'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/lib/context/notification';
import { useEffect } from 'react';
import { publicService } from '@/lib/api/public';
import EventDetails from '@/components/events/EventDetails';

export default function EventDetailsPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    
  }, [router]);

  return <EventDetails />;
}
