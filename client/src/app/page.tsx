'use client';

import { Onboarding } from "@/components/auth/Onboarding";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { VerifyEmail } from "@/components/auth/VerifyEmail";
import { Landing } from "@/components/landing/Landing";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useState } from "react";

type AuthStep = 'onboarding' | 'login' | 'register' | 'verify-email' | 'landing' | 'dashboard';
type OnboardingState = 'start' | 'demo';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('onboarding');
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);

  const handleRoleSelect = (state: OnboardingState) => {
    console.log("Selected role:", state);
    setOnboardingState(state);
    if (state === 'start') {
      setCurrentStep('register');
    } else {
      setCurrentStep('landing');
    }
  };

  const handleLoginClick = () => {
    setCurrentStep('login');
  };

  const handleGoBack = () => {
    setCurrentStep('onboarding');
  };

  const handleSignupSuccess = () => {
    setCurrentStep('verify-email');
  };

  const handleVerificationSuccess = () => {
    console.log("Registration complete! Redirecting to landing page...");
    setCurrentStep('landing');
  };

  const handleLoginSuccess = () => {
    console.log("Login successful! Redirecting to dashboard...");
    // For now, assume login leads to host dashboard
    setCurrentStep('dashboard');
  };

  const handleLogout = () => {
    setCurrentStep('onboarding');
  };

  const handleLandingLogout = () => {
    setCurrentStep('onboarding');
  };

  switch (currentStep) {
    case 'login':
      return <Login onLogin={handleLoginSuccess} onGoBack={handleGoBack} />;
    case 'register':
      return <Register onSuccess={handleSignupSuccess} onGoBack={handleGoBack} />;
    case 'verify-email':
      return <VerifyEmail onVerified={handleVerificationSuccess} />;
    case 'landing':
      return <Landing onLogout={handleLandingLogout} />;
    case 'dashboard':
      return <Dashboard onLogout={handleLogout} />;
    default:
      return <Onboarding onContinue={handleRoleSelect} onLogin={handleLoginClick} />;
  }
}
