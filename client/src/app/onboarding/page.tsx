'use client';

import { Onboarding } from "@/components/auth/Onboarding";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleContinue = (role: 'host' | 'user') => {
    // Route to auth page with role parameter
    router.push(`/auth?tab=signup&role=${role}`);
  };

  const handleLogin = () => {
    router.push('/auth?tab=login');
  };

  return <Onboarding onContinue={handleContinue} onLogin={handleLogin} />;
}
