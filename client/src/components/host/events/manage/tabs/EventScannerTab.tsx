'use client';

import { useState, useEffect } from 'react';
import { 
  QrCode, 
  Smartphone, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Copy,
  ExternalLink,
  Power,
  PowerOff,
  RefreshCw,
  Plus
} from 'lucide-react';
import { scannerService, SessionDetailsResponse, CreateSessionResponse } from '@/lib/api/scanner';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';
import { useNotification } from '@/lib/context/notification';
import OTPDialog from './scanner/OTPDialog';

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
        // No active session or error - that's okay, show create button
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
      setSession(null);
      setScannerUrl('');
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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (!canUseScanner) {
    return (
      <div className="max-w-[1080px] mx-auto py-12">
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">Scanner Not Available</h3>
          <p className="text-sm text-slate-500">
            Scanner functionality is only available for published, live, or ended events.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-[1080px] mx-auto py-12">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-brand-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">QR Code Scanner</h3>
            <p className="text-sm text-slate-500 max-w-[1080px] mx-auto">
              Create a scanner session to enable your staff to scan tickets at the event entrance using their phones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <Smartphone className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-slate-700 mb-1">Browser-Based</h4>
              <p className="text-xs text-slate-500">No app installation required</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-slate-700 mb-1">Multiple Devices</h4>
              <p className="text-xs text-slate-500">Up to 5 devices per session</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-slate-700 mb-1">Offline Support</h4>
              <p className="text-xs text-slate-500">Works without internet</p>
            </div>
          </div>

          <button
            onClick={handleCreateSession}
            disabled={creating}
            className="w-full max-w-[360px] mx-auto bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Session...
              </>
            ) : (
              <>
                <Power className="w-5 h-5" />
                Activate Scanner
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const { session: sessionData, devices, stats } = session;
  const isActive = sessionData.sessionStatus === 'active';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Session Status Card */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <div>
              <h3 className="sm:text-lg text-md font-[400] text-slate-800">Scanner Session</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {isActive ? 'Active' : 'Closed'} • Expires {formatTime(sessionData.expiresAt)}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseSession}
            disabled={loading || !isActive}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PowerOff className="w-4 h-4" />
            Close Session
          </button>
        </div>

        {/* Scanner URL */}
        {scannerUrl && isActive && (
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-6">
            <label className="text-xs sm:text-sm font-medium text-brand-700 mb-2 block">Scanner Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={scannerUrl}
                readOnly
                className="flex-1 bg-white border border-brand-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-700 font-mono"
              />
              <button
                onClick={() => copyToClipboard(scannerUrl)}
                className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <a
                href={scannerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                title="Open scanner"
              >
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-brand-600">Share this link with your staff to start scanning tickets</p>
              <button
                onClick={() => setShowOTPDialog(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Device
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs font-[300] text-slate-600">Successful</span>
            </div>
            <p className="text-2xl font-[400] text-slate-800">{stats.success}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-[300] text-slate-600">Duplicates</span>
            </div>
            <p className="text-2xl font-[400] text-slate-800">{stats.duplicate}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-[300] text-slate-600">Invalid</span>
            </div>
            <p className="text-2xl font-[400] text-slate-800">{stats.invalid + stats.expired}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-brand-500" />
              <span className="text-xs font-[300] text-slate-600">Total Scans</span>
            </div>
            <p className="text-2xl font-[400] text-slate-800">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Active Devices */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-[400] text-slate-800">Devices</h3>
          <span className="text-sm text-slate-500">
            {devices.filter(d => d.isOnline && d.status !== 'disabled').length} / {sessionData.maxDevices} online
          </span>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">No devices connected yet</p>
            <p className="text-xs mt-1">Share the scanner link with your staff</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {devices.map((device) => {
              const isDisabled = device.status === 'disabled';
              return (
              <div
                key={device._id}
                className={`p-4 hover:bg-slate-50 transition-colors ${isDisabled ? 'opacity-60 bg-slate-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Device Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${isDisabled ? 'bg-red-400' : device.isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium truncate ${isDisabled ? 'text-slate-500' : 'text-slate-800'}`}>{device.deviceName}</p>
                        {isDisabled ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                            Disabled
                          </span>
                        ) : device.isOnline && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Online
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Last seen {formatTimeAgo(device.lastSeen)}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{device.totalScans} scans</span>
                        {device.revokedAt && (
                          <>
                            <span>•</span>
                            <span className="text-red-600">Revoked {formatTimeAgo(device.revokedAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isDisabled ? (
                      <button
                        onClick={async () => {
                          try {
                            await scannerService.enableDevice(device._id, sessionData._id);
                            showNotification('success', 'Device Re-enabled', `${device.deviceName} can now scan again`);
                            fetchSessionDetails(sessionData._id);
                          } catch (err: any) {
                            showNotification('error', 'Failed to Re-enable', err.message);
                          }
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Re-enable device"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          if (confirm(`Disable ${device.deviceName}? This will prevent it from scanning.`)) {
                            try {
                              await scannerService.disableDevice(device._id, sessionData._id);
                              showNotification('success', 'Device Disabled', `${device.deviceName} has been disabled`);
                              fetchSessionDetails(sessionData._id);
                            } catch (err: any) {
                              showNotification('error', 'Failed to Disable', err.message);
                            }
                          }
                        }}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Disable device"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm(`Force logout ${device.deviceName}? This will revoke access immediately.`)) {
                          try {
                            await scannerService.forceLogoutDevice(device._id, sessionData._id);
                            showNotification('success', 'Device Logged Out', `${device.deviceName} has been logged out`);
                            fetchSessionDetails(sessionData._id);
                          } catch (err: any) {
                            showNotification('error', 'Failed to Logout', err.message);
                          }
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Force logout"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
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
