
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
import { DeviceList } from './scanner/DeviceList';
import { ManualVerification } from './scanner/ManualVerification';
import { ToolsCard } from './scanner/ToolsCard';

interface EventScannerTabProps {
  data: HostEventDetailsResponse | null;
}

export function EventScannerTab({ data }: EventScannerTabProps) {
  const [session, setSession] = useState<SessionDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [scannerUrl, setScannerUrl] = useState<string>('');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  
  // Manual verification state
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  
  // PDF download state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [lastDownloadInfo, setLastDownloadInfo] = useState<{
    timestamp: Date;
    ticketCount: number;
  } | null>(null);
  const [currentTicketCount, setCurrentTicketCount] = useState(0);
  
  const { showNotification } = useNotification();

  const eventId = data?.event?._id;
  const eventStatus = data?.event?.status;
  const eventStartDate = data?.event?.schedule?.startDate;

  // Check if event starts within 24 hours
  const isWithin24Hours = eventStartDate 
    ? (new Date(eventStartDate).getTime() - new Date().getTime()) <= 24 * 60 * 60 * 1000
    : false;

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

  // Track current ticket count for new ticket alerts
  useEffect(() => {
    if (!eventId || !data?.event) return;
    
    const fetchTicketCount = async () => {
      try {
        // Calculate total tickets sold from event data
        const count = data.event.tickets?.reduce((sum: number, t: any) => sum + (t.sold || 0), 0) || 0;
        setCurrentTicketCount(count);
      } catch (error) {
        console.error('Failed to fetch ticket count:', error);
      }
    };
    
    fetchTicketCount();
    // Update every 30 seconds
    const interval = setInterval(fetchTicketCount, 30000);
    
    return () => clearInterval(interval);
  }, [eventId, data]);

  // PDF Download Handler
  const handleDownloadTicketSheet = async () => {
    if (!eventId || isGeneratingPDF) return;

    try {
      setIsGeneratingPDF(true);

      // Use scanner service instead of direct fetch
      const { blob, ticketCount, generatedAt } = await scannerService.downloadTicketSheet(eventId);

      // Download PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-sheet-${eventId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update last download info
      setLastDownloadInfo({
        timestamp: generatedAt,
        ticketCount
      });

      showNotification('success', 'Download Complete', `PDF with ${ticketCount} tickets downloaded`);
    } catch (error: any) {
      console.error('PDF generation error:', error);
      
      // Show specific error messages
      let errorMessage = 'Failed to generate PDF';
      if (error.message.includes('available 24 hours')) {
        errorMessage = 'Ticket sheet only available 24 hours before event';
      } else if (error.message.includes('No tickets')) {
        errorMessage = 'No tickets found for this event';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Generation timed out. Please try again.';
      }
      
      showNotification('error', 'Generation Failed', errorMessage + '. Contact support if issue persists.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

  // Manual verification handlers
  const handleLookupTicket = async (ticketId: string) => {
    if (!session?.session?._id) {
       showNotification('error', 'No Active Session', 'Please activate a scanner session first');
       return;
    }

    try {
      setIsLookingUp(true);
      setVerificationResult(null);
      
      const result = await scannerService.lookupTicket(ticketId, session.session._id);
      
      if (!result.found) {
        showNotification('error', 'Ticket Not Found', result.message || 'Ticket not found');
        return;
      }

      setVerificationResult(result.ticket);
    } catch (error: any) {
      showNotification('error', 'Lookup Failed', error.message);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleManualCheckIn = async (notes?: string) => {
    if (!verificationResult?.ticketNumber || !session?.session?._id) return;

    try {
      setIsCheckingIn(true);
      
      await scannerService.manualCheckIn(verificationResult.ticketNumber, session.session._id, notes);
      
      showNotification('success', 'Check-in Successful', 'Ticket checked in manually');
      
      // Refresh verification result to show new status
      const result = await scannerService.lookupTicket(verificationResult.ticketNumber, session.session._id);
      if (result.found) {
         setVerificationResult(result.ticket);
      }
      
    } catch (error: any) {
      showNotification('error', 'Check-in Failed', error.message);
    } finally {
      setIsCheckingIn(false);
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
      {/* Top Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6 h-[400px]">
          <ScannerOverview stats={currentStats} />
        </div>
        <div className="lg:col-span-4 h-[400px]">
            <SessionManager 
                session={session?.session ? session.session : undefined}
                loading={loading || creating}
                onCreate={handleCreateSession}
                onClose={handleCloseSession}
                scannerUrl={scannerUrl}
                onCopy={copyToClipboard}
            />
        </div>
      </div>

      {/* Secondary Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="min-h-[500px]">
            <DeviceList 
                devices={currentDevices} 
                maxDevices={maxDevices}
                onAddDevice={() => setShowOTPDialog(true)}
                onRefresh={() => session?.session?._id && fetchSessionDetails(session.session._id)}
                onDisableDevice={handleDisableDevice}
                onEnableDevice={handleEnableDevice}
                onForceLogout={handleForceLogout}
            />
        </div>
        <div className="grid grid-cols-1 gap-6 min-h-[500px]">
            <div className="flex-1 min-h-[300px]">
                <ManualVerification 
                    onLookup={handleLookupTicket}
                    isLookingUp={isLookingUp}
                    verificationResult={verificationResult}
                    onCheckIn={handleManualCheckIn}
                    isCheckingIn={isCheckingIn}
                    onClearResult={() => setVerificationResult(null)}
                />
            </div>
            <div className="h-auto">
                <ToolsCard 
                    onDownload={handleDownloadTicketSheet}
                    isDownloading={isGeneratingPDF}
                    isAvailable={isWithin24Hours}
                    lastDownload={lastDownloadInfo || undefined}
                    currentTicketCount={currentTicketCount}
                />
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
