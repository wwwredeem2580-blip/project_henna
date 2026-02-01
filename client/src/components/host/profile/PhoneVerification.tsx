'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Loader2, Phone, CheckCircle, AlertCircle, RefreshCw, Edit } from 'lucide-react';
import { phoneOTPAPI } from '@/lib/api/phone';
import { useNotification } from '@/lib/context/notification';

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerificationComplete: () => void;
  onPhoneUpdate?: (phoneNumber: string) => void;
}

export function PhoneVerification({
  phoneNumber,
  onVerificationComplete,
  onPhoneUpdate
}: PhoneVerificationProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const { showNotification } = useNotification();

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await phoneOTPAPI.sendOTP(phoneNumber);

      if (result.success) {
        setSuccess(result.message);
        setStep('otp');
        setResendTimer(60); // 60 seconds cooldown
        showNotification('success', 'OTP Sent', 'Check your phone for the verification code');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await phoneOTPAPI.verifyOTP(otp);

      if (result.success) {
        setSuccess(result.message);
        showNotification('success', 'Phone Verified', 'Your phone number has been verified successfully');
        onVerificationComplete();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await phoneOTPAPI.resendOTP(phoneNumber);

      if (result.success) {
        setSuccess(result.message);
        setResendTimer(60);
        showNotification('success', 'OTP Resent', 'A new verification code has been sent');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (newPhone: string) => {
    if (onPhoneUpdate) {
      onPhoneUpdate(newPhone);
    }
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-lg font-[300] text-neutral-750 mb-2">
          Phone Verification Required
        </h3>
        <p className="text-sm text-neutral-500">
          To complete your host profile, we need to verify your phone number.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {step === 'input' ? (
        <div className="space-y-4">
          <div>
            <p className='text-sm font-[300] text-neutral-750'>Phone Number</p>
            <PhoneInput
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="mt-1"
              placeholder="171 234 5678"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Enter your 10-digit phone number (without country code)
            </p>
          </div>

          <Button
            onClick={handleSendOTP}
            disabled={isLoading || !phoneNumber.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <span className="flex items-center bg-brand-600 text-white rounded-tr-md rounded-bl-md hover:translate-y-[-2px] transition-all px-4 py-2 gap-2">
                <Phone className="w-4 h-4 mr-2" />
                Send Verification Code
              </span>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className='text-sm font-[300] text-neutral-750'>Verification Code</p>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setError(null);
              }}
              className="mt-1 text-center text-lg tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-neutral-500 mt-1 text-center">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="flex-1 bg-brand-500 text-white rounded-tr-md rounded-bl-md hover:translate-y-[-2px] transition-all px-4 py-2 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Code
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isLoading || resendTimer > 0}
              className="flex-1 hover:scale-103 transition-all"
            >
              {resendTimer > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend ({resendTimer}s)
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setStep('input')}
            className="w-full bg-brand-500 text-white text-sm rounded-tr-md rounded-bl-md hover:translate-y-[-2px] transition-all px-4 py-2 gap-2"
          >
            <Edit />
            Change Phone Number
          </Button>
        </div>
      )}
    </div>
  );
}
