'use client';

import { Onboarding } from "@/components/auth/Onboarding";
import { Login } from "@/components/auth/Login";
import { SignupHost } from "@/components/auth/SignupHost";
import { SignupUser } from "@/components/auth/SignupUser";
import { VerifyEmail } from "@/components/auth/VerifyEmail";
import { Landing } from "@/components/landing/Landing";
import { HostDashboard } from "@/components/dashboard/HostDashboard";
import { UserRole } from "@/types";
import { useState } from "react";

type AuthStep = 'onboarding' | 'login' | 'signup-host' | 'signup-user' | 'verify-email' | 'landing' | 'host-dashboard';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('onboarding');
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    console.log("Selected role:", role);
    setUserRole(role);
    if (role === 'host') {
      setCurrentStep('signup-host');
    } else {
      setCurrentStep('signup-user');
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
    setCurrentStep('host-dashboard');
  };

  const handleLogout = () => {
    setCurrentStep('onboarding');
    setUserRole(null);
  };

  const handleLandingLogout = () => {
    setCurrentStep('onboarding');
    setUserRole(null);
  };

  switch (currentStep) {
    case 'login':
      return <Login onLogin={handleLoginSuccess} onGoBack={handleGoBack} />;
    case 'signup-host':
      return <SignupHost onSuccess={handleSignupSuccess} onGoBack={handleGoBack} />;
    case 'signup-user':
      return <SignupUser onSuccess={handleSignupSuccess} onGoBack={handleGoBack} />;
    case 'verify-email':
      return <VerifyEmail onVerified={handleVerificationSuccess} />;
    case 'landing':
      return <Landing onLogout={handleLandingLogout} />;
    case 'host-dashboard':
      return <HostDashboard onLogout={handleLogout} />;
    default:
      return <Onboarding onContinue={handleRoleSelect} onLogin={handleLoginClick} />;
  }
}
