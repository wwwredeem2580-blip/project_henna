
import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, AlertCircle, X, Loader2 } from 'lucide-react';
import VerificationResultCard from './VerificationResultCard';
import { scannerService } from '@/lib/api/scanner';

interface ManualVerificationProps {
  sessionId: string;
  onLookup: (ticketId: string) => void;
  isLookingUp: boolean;
  verificationResult: any;
  onCheckIn: (notes?: string) => void;
  isCheckingIn: boolean;
  onClearResult: () => void;
}

interface SearchResult {
  ticketId: string;
  ticketNumber: string;
  ticketType: string;
  holderName: string;
  status: string;
  checkInStatus: string;
  checkedInAt?: Date;
}

export const ManualVerification: React.FC<ManualVerificationProps> = ({
  sessionId,
  onLookup,
  isLookingUp,
  verificationResult,
  onCheckIn,
  isCheckingIn,
  onClearResult
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await scannerService.searchTickets(sessionId, searchQuery);
        setSearchResults(results.tickets);
        setShowDropdown(results.tickets.length > 0);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, sessionId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTicket = (ticket: SearchResult) => {
    onLookup(ticket.ticketNumber); // Use ticketNumber instead of ticketId
    setShowDropdown(false);
    setSearchQuery('');
  };

  const getStatusBadge = (checkInStatus: string) => {
    if (checkInStatus === 'checked_in') {
      return <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Checked In</span>;
    }
    return <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Not Checked In</span>;
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
                    setSearchQuery('');
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
            <div className="relative" ref={dropdownRef}>
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#683ee6] transition-colors" />
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    placeholder="Type last 3-4 characters (e.g., A1B2)"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-transparent rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#683ee6]/20 focus:ring-4 ring-[#683ee6]/5 outline-none transition-all"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                )}

                {/* Dropdown Results */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[300px] overflow-y-auto z-50">
                    {searchResults.map((ticket) => (
                      <button
                        key={ticket.ticketId}
                        onClick={() => handleSelectTicket(ticket)}
                        className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b last:border-0 text-left transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-mono text-sm text-slate-900 font-medium">{ticket.ticketNumber}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{ticket.holderName} • {ticket.ticketType}</p>
                        </div>
                        {getStatusBadge(ticket.checkInStatus)}
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50">
                    <p className="text-sm text-slate-500 text-center">No tickets found matching "{searchQuery}"</p>
                  </div>
                )}
            </div>

            <p className="text-xs text-slate-500">
              💡 Tip: Type the last few characters of the ticket number to search
            </p>
        </div>
      )}
    </div>
  );
};
