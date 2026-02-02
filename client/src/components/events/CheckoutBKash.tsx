import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Phone, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Info
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CheckoutBKashProps {
  amount: number;
  eventName: string;
  tierName: string;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  orderId?: string;
}

type Step = 'number' | 'otp' | 'pin' | 'processing' | 'success';

export const CheckoutBKash: React.FC<CheckoutBKashProps> = ({ 
  amount, 
  eventName, 
  tierName, 
  onClose, 
  onSuccess,
  orderId
}) => {
  const [step, setStep] = useState<Step>('number');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [paymentId] = useState(() => uuidv4()); // Generate payment ID once

  const handleNext = () => {
    if (step === 'number') setStep('otp');
    else if (step === 'otp') setStep('pin');
    else if (step === 'pin') {
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        // Pass paymentId to parent for callback processing
        setTimeout(() => onSuccess(paymentId), 2000);
      }, 2500);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" 
        onClick={step !== 'processing' ? onClose : undefined}
      />
      
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative w-full max-w-[450px] bg-slate-50 rounded-tr-lg rounded-bl-lg shadow-4xl overflow-hidden border border-slate-100"
      >
        {/* Header Section */}
        <div className="p-4 sm:p-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D12053]/10 flex items-center justify-center">
              <img 
                src="https://static.vecteezy.com/system/resources/previews/039/340/798/non_2x/bkash-logo-free-vector.jpg" 
                className="w-12 object-contain" 
                alt="bKash" 
              />
            </div>
            <div>
              <h3 className="text-sm font-[500] text-neutral-600 tracking-tight">bKash Payment</h3>
              <p className="text-[10px] font-[400] text-neutral-400 uppercase tracking-widest">Secure Gateway</p>
            </div>
          </div>
          {step !== 'processing' && step !== 'success' && (
            <button onClick={onClose} className="p-2 text-neutral-300 hover:text-neutral-600 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Amount Summary */}
        <div className="px-4 sm:px-8 mb-8">
          <div className="p-2 sm:p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-[500] uppercase tracking-widest text-neutral-400 mb-1">{tierName}</p>
              <h4 className="text-sm font-[300] text-neutral-600 truncate max-w-[180px]">{eventName}</h4>
            </div>
            <div className="text-right">
              <p className="text-md font-[300] text-neutral-900">৳{amount}</p>
              <p className="text-[8px] font-[300] text-neutral-400 uppercase tracking-widest">Amount Due</p>
            </div>
          </div>
        </div>

        {/* Multi-step Flow Content */}
        <div className="px-4 sm:px-10 pb-12">
          <AnimatePresence mode="wait">
            {step === 'number' && (
              <motion.div key="number" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-[300] text-neutral-600 uppercase tracking-widest ml-1">Wallet Number</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="tel" 
                      placeholder="01XXXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#D12053]/30 focus:bg-white rounded-2xl text-base font-[500] outline-none transition-all placeholder:text-slate-200"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleNext}
                  disabled={phoneNumber.length < 11}
                  className="w-full bg-[#D12053] text-white py-3 rounded-tr-lg rounded-bl-lg font-[500] text-base flex items-center justify-center gap-3 hover:bg-[#B11B46] transition-all shadow-xl shadow-[#D12053]/20 disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  Send OTP <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 text-center">
                <div className="space-y-2">
                  <label className="text-xs font-[500] text-slate-950 uppercase tracking-widest">Verification Code</label>
                  <p className="text-xs text-slate-400 font-[400]">Sent to {phoneNumber}</p>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="0 0 0 0 0 0"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center py-4 bg-slate-50 border-2 border-transparent focus:border-[#D12053]/30 focus:bg-white rounded-2xl text-2xl font-[500] tracking-[0.5em] outline-none transition-all placeholder:text-slate-200"
                  />
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={handleNext}
                    disabled={otp.length < 6}
                    className="w-full bg-[#D12053] text-white py-3 rounded-tr-lg rounded-bl-lg font-[500] text-base hover:bg-[#B11B46] transition-all shadow-xl shadow-[#D12053]/20 disabled:opacity-30"
                  >
                    Verify & Continue
                  </button>
                  <button className="text-[10px] font-[400] text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Resend OTP in 54s</button>
                </div>
              </motion.div>
            )}

            {step === 'pin' && (
              <motion.div key="pin" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-[400] text-slate-950 uppercase tracking-widest">bKash PIN</label>
                    <div className="flex items-center gap-1 text-[#D12053]"><Lock size={12}/> <span className="text-[10px] font-bold">Encrypted</span></div>
                  </div>
                  <input 
                    type="password" 
                    maxLength={5}
                    placeholder="• • • • •"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full text-center py-4 bg-slate-50 border-2 border-transparent focus:border-[#D12053]/30 focus:bg-white rounded-2xl text-2xl font-[500] tracking-[0.5em] outline-none transition-all placeholder:text-slate-200"
                  />
                </div>
                <button 
                  onClick={handleNext}
                  disabled={pin.length < 5}
                  className="w-full bg-[#D12053] text-white py-3 rounded-tr-lg rounded-bl-lg font-[500] text-base hover:bg-[#B11B46] transition-all shadow-xl shadow-[#D12053]/20 disabled:opacity-30"
                >
                  Confirm Payment
                </button>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="py-10 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <Loader2 className="text-[#D12053] animate-spin" size={48} />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-[500] text-slate-800 tracking-tight">Processing Payment</h4>
                  <p className="text-xs text-slate-400 font-[300]">Please do not close this window...</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="py-10 flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-[500] text-slate-800 tracking-tight">Payment Successful</h4>
                  <p className="text-xs text-slate-400 font-[300]">Transaction ID: 9J2B81X3A</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Security Note */}
        <div className="p-6 bg-slate-50 flex items-center justify-center gap-3">
          <ShieldCheck className="text-slate-300" size={16}/>
          <p className="text-[10px] font-[300] text-slate-400 uppercase tracking-widest">PCI-DSS Compliant Infrastructure</p>
        </div>
      </motion.div>
    </div>
  );
};
