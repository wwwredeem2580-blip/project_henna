'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/lib/context/notification';
import { useEffect } from 'react';
import { publicService } from '@/lib/api/public';
import Wallet from '@/components/wallet/Wallet';

function WalletContent() {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    
  }, [router]);

  return <Wallet />;
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-brand-600">Loading...</div></div>}>
      <WalletContent />
    </Suspense>
  );
}
