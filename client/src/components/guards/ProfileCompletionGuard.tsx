'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hostEventsService } from '@/lib/api/host';
import { useNotification } from '@/lib/context/notification';

interface ProfileGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Guard component that checks if host profile is complete before allowing access
 * Redirects to profile page if phone verification or payment details are missing
 */
export function ProfileCompletionGuard({ children, redirectTo = '/host/profile' }: ProfileGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await hostEventsService.getProfile();
        
        if (!profile.profileComplete) {
          // Determine which step is missing
          const missingStep = !profile.phoneVerified 
            ? 'phone verification' 
            : 'payment details';
          
          // Show notification (you can integrate with your notification system)
          showNotification('error', 'Profile incomplete', `Profile incomplete: ${missingStep} required`);
          
          // Redirect to profile page
          router.push(redirectTo);
        } else {
          setIsComplete(true);
        }
      } catch (error) {
        showNotification('error', 'Profile check failed', `${error}`);
        // On error, redirect to profile to be safe
        router.push(redirectTo);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkProfile();
  }, [router, redirectTo]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Checking profile...</p>
        </div>
      </div>
    );
  }

  // Only render children if profile is complete
  return isComplete ? <>{children}</> : null;
}
