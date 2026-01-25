'use client';

import { Onboarding } from "@/components/auth/Onboarding";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleContinue = (role: 'host' | 'user') => {
    if (role === 'host') {
      router.push('/auth?tab=signup&role=host');
    } else {
      // Demo - could show a demo video or redirect to landing
      router.push('/auth?tab=signup&role=user');
    }
  };

  const handleLogin = () => {
    router.push('/auth?tab=login');
  };

  return <Onboarding onContinue={handleContinue} onLogin={handleLogin} />;
}
