'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/lib/context/notification';
import { useEffect } from 'react';
import { publicService } from '@/lib/api/public';
import Wallet from '@/components/wallet/Wallet';

export default function WalletPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    
  }, [router]);

  return <Wallet />;
}
