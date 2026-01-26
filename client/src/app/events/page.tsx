'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/lib/context/notification';
import { useEffect } from 'react';
import { publicService } from '@/lib/api/public';
import Events from '@/components/events/Events';

export default function EventsPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    
  }, [router]);

  return <Events />;
}
