'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, RefreshCw } from 'lucide-react';
import { scannerService } from '@/lib/api/scanner';

interface OTPDialogProps {
  sessionId: string;
  onClose: () => void;
}

export default function OTPDialog({ sessionId, onClose }: OTPDialogProps) {
  const [otp, setOtp] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPairedMessage, setShowPairedMessage] = useState(false);

  const generateOTP = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await scannerService.generateOTP(sessionId);
      setOtp(result.otp);
      setExpiresAt(new Date(result.expiresAt));
    } catch (err: any) {
      setError(err.message || 'Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateOTP();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Poll to detect OTP usage and auto-regenerate
  useEffect(() => {
    console.log('[OTP Dialog] Polling effect triggered. OTP:', otp, 'TimeLeft:', timeLeft);
    
    if (!otp || timeLeft === 0) {
      console.log('[OTP Dialog] Polling skipped - no OTP or expired');
      return;
    }

    let isGenerating = false; // Prevent concurrent regenerations

    const checkOTPStatus = async () => {
      if (isGenerating) {
        console.log('[OTP Dialog] Already generating, skipping check');
        return;
      }

      try {
        console.log('[OTP Dialog] Checking OTP status for session:', sessionId);
        // Check if OTP is still valid by trying to get session details
        const session = await scannerService.getSessionDetails(sessionId);
        
        console.log('[OTP Dialog] Session data received:', {
          hasOTP: !!session.session.pairingOTP,
          otpCode: session.session.pairingOTP?.code,
          otpUsed: session.session.pairingOTP?.used,
          currentOTP: otp
        });
        
        // If OTP was used (marked as used in backend), generate new one
        if (session.session.pairingOTP?.used && session.session.pairingOTP.code === otp) {
          console.log('[OTP Dialog] ✅ OTP was used! Generating new one...');
          isGenerating = true;
          setError(''); // Clear any errors
          
          // Generate new OTP
          const result = await scannerService.generateOTP(sessionId);
          console.log('[OTP Dialog] New OTP generated:', result.otp);
          
          setOtp(result.otp);
          setExpiresAt(new Date(result.expiresAt));
          setCopied(false);
          
          // Show success message
          setShowPairedMessage(true);
          setTimeout(() => setShowPairedMessage(false), 3000);
          
          console.log('[OTP Dialog] State updated with new OTP');
          isGenerating = false;
        } else {
          console.log('[OTP Dialog] OTP not used yet or code mismatch');
        }
      } catch (err: any) {
        // Log errors but don't break polling
        console.error('[OTP Dialog] ❌ Error checking OTP status:', err);
        isGenerating = false;
      }
    };

    // Check every 2 seconds
    console.log('[OTP Dialog] Starting polling interval (2s)');
    const interval = setInterval(checkOTPStatus, 2000);
    
    // Initial check
    checkOTPStatus();
    
    return () => {
      console.log('[OTP Dialog] Cleaning up polling interval');
      clearInterval(interval);
    };
  }, [otp, timeLeft, sessionId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[480px] w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-[500] text-slate-900">Device Pairing Code</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : otp ? (
          <>
            {/* OTP Display */}
            <div className="mb-6">
              <div className="bg-brand-50 rounded-xl p-6 text-center">
                <div className="text-4xl font-mono font-bold text-brand-600 tracking-wider mb-2">
                  {otp.slice(0, 3)} {otp.slice(3)}
                </div>
                <div className="text-sm text-slate-500">
                  {timeLeft > 0 ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Expires in {formatTime(timeLeft)}
                    </span>
                  ) : (
                    <span className="text-red-600">Expired</span>
                  )}
                </div>
              </div>
              {showPairedMessage && (
                <p className="text-xs text-center text-green-600 mt-2 animate-pulse">
                  ✓ Device paired! New code generated
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="mb-6 space-y-2">
              <p className="text-sm text-slate-600">
                <span className="font-[500] text-slate-900">Step 1:</span> Share the scanner link with the device
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-[500] text-slate-900">Step 2:</span> Device enters this code to pair
              </p>
              <p className="text-xs text-slate-400 mt-3">
                ⚠️ Code is valid for 5 minutes and can only be used once
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                disabled={timeLeft === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>
              <button
                onClick={generateOTP}
                disabled={timeLeft > 0}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                New Code
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
