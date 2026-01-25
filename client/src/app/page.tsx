'use client';

import { Landing } from "@/components/landing/Landing";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleLogin = () => {
    router.push('/auth?tab=login&role=user');
  };

  return <Landing onGetStarted={handleGetStarted} onLogin={handleLogin} />;
}
