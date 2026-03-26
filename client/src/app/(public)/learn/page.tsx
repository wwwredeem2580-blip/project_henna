'use client';

import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  router.replace('/learn/how-zenvy-protects-buyers');
  return null;
}
