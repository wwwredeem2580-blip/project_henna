'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, Loader2 } from 'lucide-react';
import { scannerService } from '@/lib/api/scanner';

interface JoinSessionResponse {
  success: boolean;
  device: {
    _id: string;
    deviceName: string;
    totalScans: number;
    createdAt: string;
  };
  session: {
    _id: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    expiresAt: string;
  };
}

function ScannerJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<'otp' | 'device'>('otp');
  const [otpCode, setOtpCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-generate device name suggestion
    const browserInfo = navigator.userAgent.includes('iPhone') ? 'iPhone' :
                       navigator.userAgent.includes('Android') ? 'Android' :
                       navigator.userAgent.includes('iPad') ? 'iPad' : 'Device';
    setDeviceName(`${browserInfo} Scanner`);
  }, []);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid scanner link');
      return;
    }

    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await scannerService.verifyOTP(token, otpCode);
      
      // OTP verified, move to device name step
      setStep('device');
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.error || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid scanner link');
      return;
    }

    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await scannerService.joinSession(token, deviceName.trim());

      // Store session data in localStorage
      localStorage.setItem('scanner_session', JSON.stringify({
        accessToken: token,
        deviceId: response.device._id,
        deviceName: response.device.deviceName,
        sessionId: response.session._id,
        eventId: response.session.eventId,
        eventTitle: response.session.eventTitle,
        eventDate: response.session.eventDate,
        expiresAt: response.session.expiresAt
      }));

      // Redirect to scanner
      router.push('/scanner/scan');
    } catch (err: any) {
      console.error('Join error:', err);
      setError(err.response?.data?.error || 'Failed to join session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-brand-50 rounded-2xl p-8 max-w-[480px] w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-[500] text-slate-800 mb-2">Invalid Link</h1>
          <p className="text-slate-600">
            This scanner link is invalid or has expired. Please request a new link from your event host.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-brand-50 rounded-2xl p-8 max-w-[480px] w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-10 h-10 text-brand-600" />
          </div>
          <h1 className="text-2xl font-[500] text-slate-800 mb-2">
            {step === 'otp' ? 'Enter Pairing Code' : 'Join Scanner Session'}
          </h1>
          <p className="text-sm text-slate-600">
            {step === 'otp' 
              ? 'Enter the 6-digit code provided by your event host'
              : 'Enter a name for this device to start scanning tickets'
            }
          </p>
        </div>

        {step === 'otp' ? (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otpCode" className="block text-sm font-medium text-slate-700 mb-2">
                Pairing Code
              </label>
              <input
                type="text"
                id="otpCode"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-center text-2xl font-mono tracking-widest"
                required
                maxLength={6}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1 text-center">
                Ask your event host for the pairing code
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="deviceName" className="block text-sm font-medium text-slate-700 mb-2">
                Device Name
              </label>
              <input
                type="text"
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., Gate 1 - John's Phone"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                required
                maxLength={50}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1">
                This helps identify your device in the dashboard
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !deviceName.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining Session...
                </>
              ) : (
                'Join Session'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            {step === 'otp' 
              ? '🔒 Secure pairing ensures only authorized devices can scan tickets'
              : 'By joining, you agree to scan tickets only for this event session'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ScannerJoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ScannerJoinContent />
    </Suspense>
  );
}
