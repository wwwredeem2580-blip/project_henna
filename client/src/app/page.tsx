import { Suspense } from 'react';
import Events from '@/components/events/Events';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-brand-600 animate-pulse">Loading...</div></div>}>
      <Events />
    </Suspense>
  );
}
