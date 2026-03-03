'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowDownLeft,
  Globe,
  ArrowRight,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X as CloseIcon,
  Loader2,
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/context/auth';
import { phoneOTPAPI } from '@/lib/api/phone';
import { useNotification } from '@/lib/context/notification';
import { hostEventsService } from '@/lib/api/host';

/* ─── Chip SVG ─── */
const ChipIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="28" rx="4" fill="#E2E8F0" />
    <path d="M12 0V28M28 0V28M0 14H40M12 8H0M28 8H40M12 20H0M28 20H40" stroke="#CBD5E1" strokeWidth="1.5" />
    <rect x="14" y="6" width="12" height="16" rx="2" stroke="#CBD5E1" strokeWidth="1.5" />
  </svg>
);

/* ─── 3D tilt payment card ─── */
const PaymentCard = ({
  type,
  details,
  color = '#161616',
  logo,
  accentColor = '#4a2bed',
}: {
  type: string;
  details: any;
  color?: string;
  logo?: React.ReactNode;
  accentColor?: string;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['-50%', '50%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div
      className="w-full max-w-[400px] aspect-[1.586/1] mx-auto group cursor-pointer"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="w-full h-full relative rounded-2xl border-2 border-wix-text-dark overflow-hidden"
        animate={{ backgroundColor: color }}
        transition={{ duration: 0.4 }}
      >
        {/* Glare */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none opacity-40"
          style={{
            background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 25%, transparent 30%)',
            x: glareX,
          }}
        />
        {/* Content */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10 text-white" style={{ transformStyle: 'preserve-3d' }}>
          <div className="flex justify-between items-start" style={{ transform: 'translateZ(40px)' }}>
            {type === 'card' ? <ChipIcon /> : <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">{logo}</div>}
            <div className="text-xl italic font-serif font-bold tracking-widest text-gray-300">
              {type === 'card' ? 'WIX' : type.toUpperCase()}
              <span className="text-white">{type === 'card' ? 'PAY' : ''}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1" style={{ transform: 'translateZ(60px)' }}>
            <div className="font-mono text-[1.4rem] sm:text-2xl tracking-[0.2em] mb-2">
              {details.number || (type === 'card' ? '**** **** **** ****' : '01XXX XXXXXX')}
            </div>
            <div className="flex justify-between items-end text-sm text-gray-400 font-medium tracking-widest uppercase">
              <div className="flex flex-col">
                <span className="text-[10px] mb-1">{type === 'card' ? 'Cardholder' : 'Account Name'}</span>
                <span className="text-white">{details.name || 'YOUR NAME'}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] mb-1">{type === 'card' ? 'Expires' : 'Status'}</span>
                <span className="text-white">{type === 'card' ? (details.expiry || 'MM/YY') : 'VERIFIED'}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Background glow */}
        <div
          className="absolute -bottom-20 -right-20 w-64 h-64 opacity-20 rounded-full blur-2xl"
          style={{ backgroundColor: accentColor }}
        />
      </motion.div>
    </div>
  );
};

/* ─── OTP Modal ─── */
const OtpModal = ({
  isOpen,
  onClose,
  phoneNumber,
  onVerify,
  onResend,
  onChangeNumber,
  verifying,
  resending,
}: {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onChangeNumber: () => void;
  verifying?: boolean;
  resending?: boolean;
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) { setOtp(['', '', '', '', '', '']); setTimer(60); return; }
    const id = setInterval(() => setTimer(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleResendClick = () => {
    if (timer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    onResend();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-[480px] p-8 sm:p-10 border border-wix-border-light shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-wix-purple/10 rounded-full flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8 text-wix-purple" />
            </div>
            <h2 className="text-2xl font-bold text-wix-text-dark mb-2">Verify Your Phone</h2>
            <p className="text-wix-text-muted text-[15px] mb-8">
              We've sent a 6-digit code to <span className="font-semibold text-wix-text-dark">{phoneNumber}</span>
            </p>
            <div className="flex gap-2 sm:gap-3 mb-8">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 border-2 border-gray-200 text-center text-xl font-bold focus:border-wix-purple outline-none transition-colors"
                />
              ))}
            </div>
            <button
              onClick={() => onVerify(otp.join(''))}
              disabled={verifying || otp.join('').length < 6}
              className="w-full bg-wix-text-dark text-white py-4 font-bold hover:bg-black transition-colors mb-6 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
              {verifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleResendClick}
                disabled={timer > 0 || resending}
                className={`text-[14px] font-medium flex items-center justify-center gap-1 ${timer > 0 || resending ? 'text-gray-400 cursor-not-allowed' : 'text-wix-purple hover:opacity-80'}`}
              >
                {resending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {timer > 0 ? `Resend code in ${timer}s` : resending ? 'Sending...' : 'Resend Code'}
              </button>
              <button onClick={onChangeNumber} className="text-[14px] font-medium text-wix-text-muted hover:text-black transition-colors">
                Change Phone Number
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ─── Main Profile/Wallet page ─── */
export function Profile() {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Payment method state
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '' });
  const [mfsDetails, setMfsDetails] = useState({ name: '', number: '' });
  const [savingPayment, setSavingPayment] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [payoutSet, setPayoutSet] = useState(false);

  // Phone verification state
  const [phoneNumber, setPhoneNumber] = useState('+880');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const profile = await hostEventsService.getProfile();
        // Phone verification
        if (profile.phoneVerified && profile.phoneVerificationDetails?.phoneNumber) {
          setIsPhoneVerified(true);
          setVerifiedPhoneNumber(profile.phoneVerificationDetails.phoneNumber);
          setPhoneNumber(profile.phoneVerificationDetails.phoneNumber);
        }
        // Payment details
        const pd = profile.paymentDetails;
        if (pd) {
          const method = pd.method || 'card';
          setSelectedMethod(method);
          if (method === 'card') {
            setCardDetails({ name: pd.accountHolderName || '', number: pd.accountNumber || '', expiry: '' });
          } else {
            setMfsDetails({ name: pd.accountHolderName || '', number: pd.mobileNumber || '' });
          }
          setPayoutSet(true);
        }
      } catch (_) {
        // silent — user may not have profile yet
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

  const paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: <CreditCard className="w-5 h-5" />, color: '#161616', accent: '#4a2bed' },
    { id: 'bkash', name: 'bKash', icon: <span className="font-bold text-[10px]">bK</span>, color: '#e2136e', accent: '#ffffff' },
    { id: 'nagad', name: 'Nagad', icon: <span className="font-bold text-[10px]">N</span>, color: '#f7941d', accent: '#ffffff' },
    { id: 'rocket', name: 'Rocket', icon: <span className="font-bold text-[10px]">R</span>, color: '#8c3494', accent: '#ffffff' },
    { id: 'upay', name: 'Upay', icon: <span className="font-bold text-[10px]">U</span>, color: '#00adef', accent: '#ffffff' },
  ];

  const currentMethod = paymentMethods.find(m => m.id === selectedMethod) || paymentMethods[0];

  /* ── Phone handlers ── */
  const handleSendOtp = async () => {
    if (!phoneNumber.startsWith('+880') || phoneNumber.replace(/\s/g, '').length < 14) {
      showNotification('error', 'Invalid Number', 'Please enter a valid Bangladesh phone number starting with +880');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await phoneOTPAPI.sendOTP(phoneNumber.replace(/\s/g, ''));
      if (res.success) {
        setShowOtpModal(true);
        showNotification('info', 'OTP Sent', `Verification code sent to ${phoneNumber}`);
      } else {
        showNotification('error', 'Failed to Send', res.message || 'Could not send OTP. Try again.');
      }
    } catch (err: any) {
      showNotification('error', 'Send Failed', err?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    if (otp.length < 6) return;
    setVerifyingOtp(true);
    try {
      const res = await phoneOTPAPI.verifyOTP(otp);
      if (res.success) {
        setIsPhoneVerified(true);
        setShowOtpModal(false);
        showNotification('success', 'Phone Verified', 'Your phone number has been verified successfully.');
      } else {
        showNotification('error', 'Invalid Code', res.message || 'The OTP you entered is incorrect.');
      }
    } catch (err: any) {
      showNotification('error', 'Verification Failed', err?.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      const res = await phoneOTPAPI.resendOTP(phoneNumber.replace(/\s/g, ''));
      if (res.success) {
        showNotification('info', 'OTP Resent', 'A new verification code has been sent.');
      } else {
        showNotification('error', 'Resend Failed', res.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      showNotification('error', 'Resend Failed', err?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendingOtp(false);
    }
  };

  /* ── Save payment method ── */
  const handleSavePayment = async () => {
    setSavingPayment(true);
    try {
      const isMobile = selectedMethod !== 'card';
      const details = isMobile
        ? {
            method: selectedMethod,
            mobileNumber: mfsDetails.number.replace(/\s/g, ''),
            accountHolderName: mfsDetails.name,
          }
        : {
            method: 'card',
            accountHolderName: cardDetails.name,
            accountNumber: cardDetails.number.replace(/\s/g, ''),
          };

      if (isMobile && (!details.mobileNumber || !details.accountHolderName)) {
        showNotification('error', 'Missing Fields', 'Please fill in Account Name and mobile number.');
        return;
      }
      if (!isMobile && (!details.accountHolderName || !details.accountNumber)) {
        showNotification('error', 'Missing Fields', 'Please fill in Name on Card and Card Number.');
        return;
      }

      await hostEventsService.updatePaymentDetails(details);
      setPayoutSet(true);
      showNotification('success', 'Saved', `${currentMethod.name} payout method saved successfully.`);
    } catch (err: any) {
      showNotification('error', 'Save Failed', err?.response?.data?.message || 'Failed to save payment method.');
    } finally {
      setSavingPayment(false);
    }
  };

  const profileComplete = isPhoneVerified && payoutSet;

  return (
    <div className="max-w-[1240px] mx-auto w-full px-6 py-12 flex flex-col gap-6">

      {/* ── Profile Complete Eligibility Banner ── */}
      <AnimatePresence>
        {profileComplete && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center gap-4 px-6 py-5 border border-green-300 bg-green-50"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 border border-green-300 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-700" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold text-green-800 uppercase tracking-wider mb-0.5">Profile Complete — You're Eligible to Create Events</div>
              <div className="text-[13px] text-green-700">Phone verified and payout method configured. You can now publish events on Zenvy.</div>
            </div>
            <a href="/host/events/create" className="shrink-0 flex items-center gap-2 bg-green-700 text-white text-[13px] font-semibold px-5 py-2.5 hover:bg-green-800 transition-colors">
              Create Event <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
        {!profileComplete && !loadingProfile && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center gap-4 px-6 py-5 border border-amber-200 bg-amber-50"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-amber-100 border border-amber-200 shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">Profile Incomplete</div>
              <div className="text-[13px] text-amber-700">
                {!isPhoneVerified && !payoutSet && 'Verify your phone number and configure a payout method to create events.'}
                {!isPhoneVerified && payoutSet && 'Verify your phone number to become eligible to create events.'}
                {isPhoneVerified && !payoutSet && 'Configure a payout method to become eligible to create events.'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex flex-col lg:flex-row gap-8">

      {/* ── Left Column ── */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">

        {/* Balance Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-wix-border-light p-8"
        >
          <h2 className="text-[15px] text-wix-text-muted font-medium uppercase tracking-wider mb-2">Available Balance</h2>
          <div className="text-[32px] font-medium tracking-tight text-wix-text-dark mb-6"><span className="text-[16px]">BDT</span> 0.00</div>
          <div className="flex gap-4">
            <button className="flex-1 bg-wix-purple text-white py-3 px-4 font-semibold hover:bg-wix-purple/90 transition-colors border border-wix-purple">
              Withdraw
            </button>
            <button className="flex-1 bg-white text-wix-text-dark py-3 px-4 font-semibold hover:bg-gray-50 transition-colors border border-wix-text-dark">
              Add Funds
            </button>
          </div>
        </motion.div>

        {/* Phone Verification Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-wix-border-light p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] text-wix-text-muted font-medium uppercase tracking-wider">Phone Verification</h2>
            {isPhoneVerified
              ? <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-300 px-2 py-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
              : <AlertCircle className="w-5 h-5 text-amber-500" />}
          </div>
          {isPhoneVerified && verifiedPhoneNumber && (
            <div className="mb-4 flex items-center gap-2 text-[13px] text-gray-600 bg-green-50 border border-green-200 px-3 py-2">
              <Smartphone className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span className="font-mono font-medium text-green-800">{verifiedPhoneNumber}</span>
              <span className="text-green-600 ml-auto">✓ Phone verified</span>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                disabled={isPhoneVerified}
                className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-black focus:border-black transition-colors text-[15px] outline-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="+880 1XXX XXXXXX"
              />
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {!isPhoneVerified ? (
              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full bg-white text-wix-text-dark py-3 px-4 font-semibold hover:bg-gray-50 transition-colors border border-wix-text-dark flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                {sendingOtp ? 'Sending Code...' : 'Verify Number'}
              </button>
            ) : (
              <button
                onClick={() => { setIsPhoneVerified(false); setVerifiedPhoneNumber(null); setPhoneNumber('+880'); }}
                className="w-full text-[13px] text-gray-500 py-2 border border-gray-200 hover:border-black hover:text-black transition-colors"
              >
                Change Verified Number
              </button>
            )}
          </div>
        </motion.div>

        {/* Current Plan Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-wix-border-light p-8 flex flex-col"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[15px] text-wix-text-muted font-medium uppercase tracking-wider mb-2">Current Plan</h2>
              <div className="text-[24px] font-semibold text-wix-text-dark">Zenvy Organizer</div>
            </div>
            <span className="bg-[#d9f7a3] text-[#2e4d00] text-[11px] font-bold px-3 py-1 uppercase tracking-widest border border-[#c4e48b]">Exclusive</span>
          </div>
          <ul className="flex flex-col gap-3 mb-8 text-[15px] text-wix-text-dark">
            <li className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Platform Fee</span>
              <span className="font-medium">0% / sale</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Events Limit</span>
              <span className="font-medium">Unlimited</span>
            </li>
            <li className="flex justify-between pb-2">
              <span className="text-gray-500">Payout Window</span>
              <span className="font-medium">T+7 days</span>
            </li>
          </ul>
          <button className="w-full text-wix-text-dark py-3 px-4 font-semibold hover:bg-gray-50 transition-colors border border-wix-text-dark">
            View Plan Details
          </button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-wix-border-light p-8"
        >
          <h2 className="text-[15px] text-wix-text-muted font-medium uppercase tracking-wider mb-6">Recent Activity</h2>
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-wix-text-dark">Ticket Payout</span>
                  <span className="text-[13px] text-gray-500">No payouts yet</span>
                </div>
              </div>
              <span className="text-[15px] font-medium text-wix-text-dark">৳—</span>
            </div>
            <div className="flex justify-between items-center group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <ArrowDownLeft className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-wix-text-dark">Funds Added</span>
                  <span className="text-[13px] text-gray-500">—</span>
                </div>
              </div>
              <span className="text-[15px] font-medium text-green-700">৳—</span>
            </div>
          </div>
          <button className="text-[14px] text-wix-purple font-medium hover:opacity-80 mt-6 flex items-center gap-1">
            View all transactions <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>
      </div>

      {/* ── Right Column: Payment Methods & 3D Card ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-2/3 bg-white border border-wix-border-light p-8 lg:p-12 flex flex-col"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div>
            <h1 className="text-[32px] font-medium tracking-tight text-wix-text-dark leading-none mb-2">Payout Method</h1>
            <p className="text-[15px] text-wix-text-muted">Configure where you receive event ticket payouts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex items-center gap-2 px-4 py-2 border transition-all ${
                  selectedMethod === method.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                }`}
              >
                {method.icon}
                <span className="text-[13px] font-semibold">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Card Preview */}
        <div className="w-full bg-wix-gray-bg border border-wix-border-light p-8 lg:p-16 mb-10 flex flex-col items-center justify-center overflow-hidden relative group">
          <div className="absolute top-4 left-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Interactive Preview</div>
          <PaymentCard
            type={selectedMethod}
            details={selectedMethod === 'card' ? cardDetails : mfsDetails}
            color={currentMethod.color}
            accentColor={currentMethod.accent}
            logo={currentMethod.icon}
          />
          <div className="mt-8 flex gap-2 items-center opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            <span className="text-[13px] text-gray-500 font-medium tracking-wide">Hover to interact</span>
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="w-full max-w-[520px] mx-auto">
          <h3 className="text-[20px] font-medium text-wix-text-dark mb-6 border-b border-wix-border-light pb-4">
            {selectedMethod === 'card' ? 'Add Payout Card' : `Configure ${currentMethod.name} Payout`}
          </h3>
          <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
            {selectedMethod === 'card' ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-wix-text-dark">Name on Card</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-black focus:border-black transition-colors text-[15px] outline-none"
                    placeholder="Jane Doe"
                    onChange={e => setCardDetails(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-wix-text-dark">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-black focus:border-black transition-colors text-[15px] font-mono outline-none"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardDetails(p => ({ ...p, number: val }));
                    }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[14px] font-medium text-wix-text-dark">Expiry Date</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-black focus:border-black transition-colors text-[15px] outline-none"
                      placeholder="MM/YY"
                      maxLength={5}
                      onChange={e => setCardDetails(p => ({ ...p, expiry: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[14px] font-medium text-wix-text-dark">Security Code (CVC)</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-black focus:border-black transition-colors text-[15px] outline-none"
                      placeholder="***"
                      maxLength={4}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-wix-text-dark">Account Name</label>
                  <input
                    type="text"
                    value={mfsDetails.name}
                    className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-black focus:border-black transition-colors text-[15px] outline-none"
                    placeholder="Jane Doe"
                    onChange={e => setMfsDetails(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-wix-text-dark">{currentMethod.name} Payout Number</label>
                  <input
                    type="text"
                    value={mfsDetails.number}
                    className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-black focus:border-black transition-colors text-[15px] font-mono outline-none"
                    placeholder="01XXX XXXXXX"
                    onChange={e => setMfsDetails(p => ({ ...p, number: e.target.value }))}
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-3 mt-2">
              <input type="checkbox" id="default-method" className="w-4 h-4 accent-black cursor-pointer" defaultChecked />
              <label htmlFor="default-method" className="text-[14px] text-wix-text-dark cursor-pointer">
                Set as default payout method
              </label>
            </div>
            <div className="mt-4 border-t border-wix-border-light pt-6 flex justify-end gap-4">
              <button type="button" className="px-6 py-3 font-semibold text-wix-text-dark hover:bg-gray-100 transition-colors border border-transparent">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                disabled={savingPayment}
                className="bg-wix-text-dark text-white px-8 py-3 font-semibold hover:bg-black transition-colors border border-black flex items-center gap-2 disabled:opacity-50"
              >
                {savingPayment && <Loader2 className="w-4 h-4 animate-spin" />}
                {savingPayment ? 'Saving...' : `Save ${selectedMethod === 'card' ? 'Card' : 'Payout Method'}`}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phoneNumber={phoneNumber}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onChangeNumber={() => setShowOtpModal(false)}
        verifying={verifyingOtp}
        resending={resendingOtp}
      />
      </div>{/* End Main Content */}
    </div>
  );
}
