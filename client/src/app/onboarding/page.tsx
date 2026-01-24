'use client';

import { Onboarding } from "@/components/auth/Onboarding";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleContinue = (state: 'start' | 'demo') => {
    if (state === 'start') {
      router.push('/auth?tab=signup');
    } else {
      // Demo - could show a demo video or redirect to landing
      router.push('/');
    }
  };

  const handleLogin = () => {
    router.push('/auth?tab=login');
  };

  return <Onboarding onContinue={handleContinue} onLogin={handleLogin} />;
}
