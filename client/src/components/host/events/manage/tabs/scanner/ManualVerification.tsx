
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
    <div className="bg-slate-50 rounded-[24px] p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Manual Action</p>
            <h3 className="text-md font-medium text-slate-700 tracking-wider">Verify & Check-in</h3>
        </div>
        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {verificationResult ? (
         <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-700 tracking-wider">Result</h4>
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
            <div className="relative group">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#683ee6] transition-colors" />
                <input 
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter Ticket ID (e.g. ZNV-...)"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#683ee6]/20 focus:ring-4 ring-[#683ee6]/5 outline-none transition-all"
                />
            </div>

            <button 
                onClick={handleVerify}
                disabled={!ticketId || isLookingUp}
                className="w-full py-3 px-6 bg-[#683ee6] text-white rounded-xl text-sm font-semibold hover:bg-[#5734c2] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
            {isLookingUp ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <ShieldCheck className="w-4 h-4" />
            )}
            {isLookingUp ? 'Verifying...' : 'Verify Ticket'}
            </button>
        </div>
      )}
    </div>
  );
};
