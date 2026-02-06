
import React, { useState } from 'react';
import { Power, Copy, Check, ExternalLink, RefreshCw, Share2 } from 'lucide-react';
import { ScannerSession } from '@/lib/api/scanner';

interface SessionManagerProps {
  session: ScannerSession | undefined;
  loading: boolean;
  scannerUrl: string;
  onCreate: () => void;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  session,
  loading,
  scannerUrl,
  onCreate,
  onClose,
  onCopy
}) => {
  const [copied, setCopied] = useState(false);

  const isActive = session?.sessionStatus === 'active';

  const handleCopy = () => {
    onCopy(scannerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-brand-50 rounded-[1.5rem] h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-md font-[500] text-slate-900">Scanner Session</h3>
          <span className={`px-2 py-0.5 text-[8px] font-[500] rounded uppercase tracking-wider ${
            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {isActive ? (
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-[500] rounded-xl hover:bg-rose-100 transition-all ml-auto"
          >
            Close
          </button>
        ) : (
          <button 
            onClick={onCreate}
            disabled={loading}
            className="px-5 py-2 bg-[#683ee6] text-white text-sm font-[500] rounded-xl hover:bg-[#5734c2] transition-all ml-auto disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Activate'}
          </button>
        )}
      </div>

      <div className="p-8 space-y-6 flex-1 flex flex-col justify-center">
        {!isActive ? (
          <div className="text-center space-y-2">
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Power className="w-6 h-6 text-slate-400" />
             </div>
             <h4 className="text-md font-[400] text-neutral-800">Session Inactive</h4>
             <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto">
               Activate the scanner session to generate a link and start connecting devices.
             </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
               <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-brand-600" />
                    </div>
                  </div>
               </div>
               
               <label className="block text-xs font-[500] text-slate-500 uppercase tracking-widest mb-2 px-1">
                 Scanner Link
               </label>
               <div className="flex flex-col gap-3">
                <div className="relative group">
                  <input 
                    type="text" 
                    readOnly 
                    value={scannerUrl}
                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-100 rounded-xl text-slate-600 text-sm font-mono truncate focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-[500] hover:border-[#683ee6] hover:text-[#683ee6] transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </button>
                  <a 
                    href={scannerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#683ee6]/5 border border-transparent text-[#683ee6] rounded-xl text-xs font-[500] hover:bg-[#683ee6]/10 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </a>
                </div>
               </div>
            </div>
            
             <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-400 justify-center">
               <Share2 className="w-3 h-3" />
               <span>Share link with verification staff</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
