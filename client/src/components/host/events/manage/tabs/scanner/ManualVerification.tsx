
import React, { useState } from 'react';
import { Search, ShieldCheck, AlertCircle, X } from 'lucide-react';
import VerificationResultCard from './VerificationResultCard';

interface ManualVerificationProps {
  onLookup: (ticketId: string) => void;
  isLookingUp: boolean;
  verificationResult: any;
  onCheckIn: (notes?: string) => void;
  isCheckingIn: boolean;
  onClearResult: () => void;
}

export const ManualVerification: React.FC<ManualVerificationProps> = ({
  onLookup,
  isLookingUp,
  verificationResult,
  onCheckIn,
  isCheckingIn,
  onClearResult
}) => {
  const [ticketId, setTicketId] = useState('');

  const handleVerify = () => {
    if (!ticketId) return;
    onLookup(ticketId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
        <ShieldCheck className="w-6 h-6 text-emerald-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">Manual Verification</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">
        Use this if scanners fail or the attendee doesn't have a QR code. All manual actions are logged.
      </p>

      {verificationResult ? (
         <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Result</h4>
                <button 
                  onClick={() => {
                    onClearResult();
                    setTicketId('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                    <X className="w-3 h-3" /> Clear
                </button>
            </div>
            <VerificationResultCard 
                ticket={verificationResult} 
                onCheckIn={onCheckIn}
                isCheckingIn={isCheckingIn}
            />
         </div>
      ) : (
        <div className="space-y-4 flex-1">
            <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                Ticket Number Lookup
            </label>
            <div className="relative group">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#683ee6] transition-colors" />
                <input 
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="e.g., ZNV-GALA-92XK7"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#683ee6] focus:ring-4 ring-[#683ee6]/10 outline-none transition-all"
                />
            </div>
            </div>

            <button 
                onClick={handleVerify}
                disabled={!ticketId || isLookingUp}
                className="w-full py-4 px-6 bg-[#683ee6] text-white rounded-2xl font-bold hover:bg-[#5734c2] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
            {isLookingUp ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <ShieldCheck className="w-5 h-5" />
            )}
            {isLookingUp ? 'Verifying...' : 'Verify Ticket'}
            </button>

            <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-2xl text-amber-700 text-xs leading-relaxed mt-auto">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Manual verification bypasses biometric checks. Ensure you've verified photo ID if required for this event.</p>
            </div>
        </div>
      )}
    </div>
  );
};
