'use client';

import { Landing } from "@/components/landing/Landing";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleLogin = () => {
    router.push('/onboarding');
  };

  return <Landing onGetStarted={handleGetStarted} onLogin={handleLogin} />;
}
