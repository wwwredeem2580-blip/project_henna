
import React from 'react';
import { Download, Loader2, Clock, AlertCircle, FileText } from 'lucide-react';

interface ToolsCardProps {
  onDownload: () => void;
  isDownloading: boolean;
  isAvailable: boolean;
  lastDownload?: {
    timestamp: Date;
    ticketCount: number;
  };
  currentTicketCount: number;
}

export const ToolsCard: React.FC<ToolsCardProps> = ({
  onDownload,
  isDownloading,
  isAvailable,
  lastDownload,
  currentTicketCount
}) => {
  const hasNewTickets = lastDownload && currentTicketCount > lastDownload.ticketCount;

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      <div>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Tools & Exports</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Download resources for offline operations and backup verification.
        </p>

        {!isAvailable && (
          <div className="mb-4 bg-slate-50 rounded-xl p-3 flex items-start gap-2">
             <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
             <p className="text-xs text-slate-500">Ticket sheet becomes available 24 hours before the event starts.</p>
          </div>
        )}

        {hasNewTickets && (
             <div className="mb-4 bg-amber-50 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                    <p className="text-xs font-bold text-amber-700">New Tickets</p>
                    <p className="text-[10px] text-amber-600">
                        {currentTicketCount - lastDownload.ticketCount} new ticket(s) since last download.
                    </p>
                </div>
             </div>
        )}
      </div>

      <div>
        <button
            onClick={onDownload}
            disabled={!isAvailable || isDownloading}
            className="w-full py-4 px-6 bg-white border border-slate-200 text-slate-700 hover:border-[#683ee6] hover:text-[#683ee6] rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
            {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Download className="w-5 h-5" />
            )}
            {lastDownload ? 'Download Latest PDF' : 'Download Ticket Sheet'}
        </button>
        {lastDownload && (
            <p className="text-center text-[10px] text-slate-400 mt-3">
                Last downloaded: {new Date(lastDownload.timestamp).toLocaleDateString()}
            </p>
        )}
      </div>
    </div>
  );
};
