import { Suspense } from 'react';
import Wallet from '@/components/wallet/Wallet';

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-wix-purple border-t-transparent rounded-full animate-spin" /></div>}>
      <Wallet />
    </Suspense>
  );
}
