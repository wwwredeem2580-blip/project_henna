
import React, { useState, useEffect } from 'react';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';
import { ManualVerification } from './scanner/ManualVerification';
import { scannerService, SessionDetailsResponse } from '@/lib/api/scanner';
import { useNotification } from '@/lib/context/notification';

export const EventCheckInTab = ({ data }: { data: HostEventDetailsResponse | null }) => {
  const { showNotification } = useNotification();
  const eventId = data?.event?._id;
  const metrics = data?.event?.metrics;
  const checkInStats = data?.analytics?.checkInStats;

  // Manual Check-in State
  const [session, setSession] = useState<SessionDetailsResponse | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Load active session for manual check-in
  useEffect(() => {
    if (!eventId) return;

    const loadSession = async () => {
      try {
        const existingSession = await scannerService.getActiveSessionByEvent(eventId);
        if (existingSession) {
          setSession(existingSession);
        }
      } catch (error) {
        console.log('No active session for manual check-in');
      }
    };

    loadSession();
  }, [eventId]);

  const handleLookupTicket = async (ticketId: string) => {
    if (!session?.session?._id) {
       showNotification('error', 'No Active Session', 'Please activate a scanner session in the Scanner tab first');
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

  const checkedIn = checkInStats?.checkedIn || metrics?.checkIns || 0;
  // If checkInStats.total is 0 or null, we might use total tickets sold as the potential pool
  const totalPotential = checkInStats?.total || data?.analytics?.totalTicketsSold || 0;
  const percentage = totalPotential > 0 ? Math.round((checkedIn / totalPotential) * 100) : 0;
  const remaining = totalPotential - checkedIn;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 animate-slide-up">
    <div className="lg:col-span-2 space-y-8">
      <div className="bg-white p-8 rounded-[38px] soft-shadow relative overflow-visible">
        <div className="flex flex-col gap-10 mb-10 mt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className='h-10 w-1 bg-indigo-500'></div>
                <p className="text-4xl font-normal tracking-wider font-toroka text-gray-800">{checkedIn}</p>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Total Checked-in</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Tracking</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{percentage}% Attended</span>
              <span>{remaining} Remaining</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-2xl overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-xl transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-slate-50 rounded-[24px] flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Check-in</p>
            <p className="text-sm font-medium text-gray-700 tracking-wider">N/A <span className="text-slate-400 whitespace-nowrap text-xs font-normal ml-1">-</span></p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[24px] flex flex-col justify-center">
             {/* Mock data for flow since API doesn't provide it yet */}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Flow</p>
            <p className="text-sm font-medium text-gray-700 tracking-wider">-- <span className="text-slate-400 whitespace-nowrap text-xs font-normal ml-1">check-ins / hr</span></p>
          </div>
        </div>

        {/* Manual Check-in Section - Inside white container, full width */}
        <ManualVerification 
            sessionId={session?.session?._id || ''}
            onLookup={handleLookupTicket}
            isLookingUp={isLookingUp}
            verificationResult={verificationResult}
            onCheckIn={handleManualCheckIn}
            isCheckingIn={isCheckingIn}
            onClearResult={() => setVerificationResult(null)}
        />
      </div>{/* End of bg-white container */}
    </div>{/* End of col-span-2 */}

    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[38px] soft-shadow">
        <h4 className="text-md font-medium tracking-wider text-gray-700 mb-6">Live Logs</h4>
        <div className="space-y-4">
          {/* Mock logs placeholders as API doesn't return logs */}
          <div className="text-center py-6">
              <p className="text-xs text-slate-400">No recent activity logs available.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
