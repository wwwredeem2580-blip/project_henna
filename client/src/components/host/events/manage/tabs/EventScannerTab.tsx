
'use client';

import { useState, useEffect } from 'react';
import { 
  QrCode
} from 'lucide-react';
import { scannerService, SessionDetailsResponse, CreateSessionResponse } from '@/lib/api/scanner';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';
import { useNotification } from '@/lib/context/notification';
import OTPDialog from './scanner/OTPDialog';

// Import new components
import { ScannerOverview } from './scanner/ScannerOverview';
import { SessionManager } from './scanner/SessionManager';

interface EventScannerTabProps {
  data: HostEventDetailsResponse | null;
}

export function EventScannerTab({ data }: EventScannerTabProps) {
  const [session, setSession] = useState<SessionDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [scannerUrl, setScannerUrl] = useState<string>('');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  
  const { showNotification } = useNotification();

  const eventId = data?.event?._id;
  const eventStatus = data?.event?.status;
  const eventStartDate = data?.event?.schedule?.startDate;

  // Check if event is eligible for scanner (published, live, or ended)
  const canUseScanner = ['published', 'live', 'ended'].includes(eventStatus || '');

  // Load existing session on mount
  useEffect(() => {
    const loadExistingSession = async () => {
      if (!eventId || !canUseScanner) return;

      try {
        setLoading(true);
        const existingSession = await scannerService.getActiveSessionByEvent(eventId);
        
        if (existingSession) {
          setSession(existingSession);
          if (existingSession.scannerUrl) {
            setScannerUrl(existingSession.scannerUrl);
          }
        }
      } catch (error: any) {
        // No active session or error - that's okay
        console.log('No active session found');
      } finally {
        setLoading(false);
      }
    };

    loadExistingSession();
  }, [eventId, canUseScanner]);

  // Auto-refresh session details every 3 seconds when session exists
  useEffect(() => {
    if (!session?.session?._id) return;

    const refreshSession = async () => {
      try {
        const details = await scannerService.getSessionDetails(session.session._id);
        setSession(details);
      } catch (error: any) {
        console.error('Failed to refresh session:', error);
      }
    };

    // Refresh every 3 seconds
    const interval = setInterval(refreshSession, 3000);
    
    return () => clearInterval(interval);
  }, [session?.session?._id]);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const details = await scannerService.getSessionDetails(sessionId);
      setSession(details);
    } catch (error: any) {
      console.error('Failed to fetch session details:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!eventId) return;

    try {
      setCreating(true);
      const result: CreateSessionResponse = await scannerService.createSession(eventId);
      
      setScannerUrl(result.scannerUrl);
      await fetchSessionDetails(result.session._id);
      
      showNotification('success', 'Scanner Session Created', 'Share the scanner link with your staff');
    } catch (error: any) {
      showNotification('error', 'Failed to Create Session', error.response?.data?.error || error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCloseSession = async () => {
    if (!session?.session?._id) return;

    if (!confirm('Are you sure you want to close this scanner session? All devices will lose access.')) {
      return;
    }

    try {
      setLoading(true);
      await scannerService.closeSession(session.session._id);
      // We don't set session to null, we just refresh it to show closed status or update local state
      // Actually, if we close it, we might want to keep showing stats but mark inactive
      const details = await scannerService.getSessionDetails(session.session._id);
      setSession(details);
      
      showNotification('success', 'Session Closed', 'Scanner session has been closed');
    } catch (error: any) {
      showNotification('error', 'Failed to Close Session', error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('success', 'Copied!', 'Scanner link copied to clipboard');
  };

  // Device Management Handlers
  const handleDisableDevice = async (deviceId: string) => {
     if (!session?.session?._id) return;
     try {
        await scannerService.disableDevice(deviceId, session.session._id);
        showNotification('success', 'Device Disabled', 'Device access has been revoked');
        fetchSessionDetails(session.session._id);
     } catch (err: any) {
        showNotification('error', 'Failed to Disable', err.message);
     }
  };

  const handleEnableDevice = async (deviceId: string) => {
    if (!session?.session?._id) return;
    try {
       await scannerService.enableDevice(deviceId, session.session._id);
       showNotification('success', 'Device Enabled', 'Device usage restored');
       fetchSessionDetails(session.session._id);
    } catch (err: any) {
       showNotification('error', 'Failed to Enable', err.message);
    }
 };

  const handleForceLogout = async (deviceId: string) => {
    if (!session?.session?._id) return;
    if (!confirm('This will immediately log out the device. Continue?')) return;
    try {
       await scannerService.forceLogoutDevice(deviceId, session.session._id);
       showNotification('success', 'Device Logged Out', 'Device has been disconnected');
       fetchSessionDetails(session.session._id);
    } catch (err: any) {
       showNotification('error', 'Failed to Logout', err.message);
    }
 };

  if (!canUseScanner) {
    return (
      <div className="max-w-[1080px] mx-auto py-12">
        <div className="bg-slate-50 rounded-[2rem] p-12 text-center border border-slate-100">
          <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Scanner Not Available</h3>
          <p className="text-slate-500">
            Scanner functionality is only available for published, live, or ended events.
            <br />
            Current Status: <span className="font-bold uppercase">{eventStatus}</span>
          </p>
        </div>
      </div>
    );
  }

  // Default empty stats if logic hasn't loaded
  const currentStats = session?.stats || {
    total: 0,
    success: 0,
    duplicate: 0,
    invalid: 0,
    expired: 0,
    cancelled: 0,
    refunded: 0
  };

  const currentDevices = session?.devices || [];
  const maxDevices = session?.session?.maxDevices || 5;

  return (
    <div className="p-0 max-w-7xl mx-auto space-y-6">
       <div className="flex flex-col xl:flex-row gap-6 items-start">
         {/* Left Column - Session & Verification */}
         <div className="w-full flex-1 mx-auto max-w-[600px] space-y-6">
             <div className="min-h-[400px]">
                 <SessionManager 
                     session={session?.session ? session.session : undefined}
                     devices={currentDevices}
                     maxDevices={maxDevices}
                     loading={loading || creating}
                     onCreate={handleCreateSession}
                     onClose={handleCloseSession}
                     scannerUrl={scannerUrl}
                     onCopy={copyToClipboard}
                     onAddDevice={() => setShowOTPDialog(true)}
                     onRefresh={() => session?.session?._id && fetchSessionDetails(session.session._id)}
                     onDisableDevice={handleDisableDevice}
                     onEnableDevice={handleEnableDevice}
                     onForceLogout={handleForceLogout}
                 />
             </div>
         </div>
 
         {/* Right Column - Stats */}
         <div className="w-full flex-1 mx-auto space-y-6">
             <div className="h-auto">
                 <ScannerOverview stats={currentStats} />
             </div>
         </div>
       </div>

      {/* OTP Dialog */}
      {showOTPDialog && session?.session?._id && (
        <OTPDialog
          sessionId={session.session._id}
          onClose={() => setShowOTPDialog(false)}
        />
      )}
    </div>
  );
}
