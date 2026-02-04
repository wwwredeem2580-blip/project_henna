'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface VerificationResult {
  ticketNumber: string;
  ticketType: string;
  holderName: string;
  wristbandColor: string;
  status: string;
  checkInStatus: string;
  isCheckedIn: boolean;
  checkedInAt?: Date;
  isExpired: boolean;
  checkInHistory: Array<{
    timestamp: Date;
    isManual: boolean;
    deviceName: string;
    verifiedBy: string | null;
  }>;
}

interface Props {
  ticket: VerificationResult;
  onCheckIn: (notes?: string) => Promise<void>;
  isCheckingIn: boolean;
}

export default function VerificationResultCard({ ticket, onCheckIn, isCheckingIn }: Props) {
  const [notes, setNotes] = useState('');

  const getStatusConfig = () => {
    if (ticket.isExpired) {
      return {
        color: 'bg-orange-50 border-orange-200',
        icon: <Clock className="w-12 h-12 text-orange-500" />,
        badge: 'bg-orange-100 text-orange-700',
        status: 'EXPIRED',
        message: 'This ticket has expired'
      };
    }

    if (ticket.isCheckedIn) {
      return {
        color: 'bg-blue-50 border-blue-200',
        icon: <CheckCircle className="w-12 h-12 text-blue-500" />,
        badge: 'bg-blue-100 text-blue-700',
        status: 'ALREADY CHECKED IN',
        message: 'This ticket was already used'
      };
    }

    if (ticket.status !== 'valid') {
      return {
        color: 'bg-red-50 border-red-200',
        icon: <XCircle className="w-12 h-12 text-red-500" />,
        badge: 'bg-red-100 text-red-700',
        status: 'INVALID',
        message: `Ticket is ${ticket.status}`
      };
    }

    return {
      color: 'bg-emerald-50 border-emerald-200',
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      badge: 'bg-emerald-100 text-emerald-700',
      status: 'VALID',
      message: 'Ready to check in'
    };
  };

  const config = getStatusConfig();
  const canCheckIn = !ticket.isCheckedIn && !ticket.isExpired && ticket.status === 'valid';

  return (
    <div className={`rounded-lg border-2 p-6 ${config.color}`}>
      {/* Status Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-2 ${config.badge}`}>
            {config.status}
          </span>
          <h3 className="text-xl font-[400] text-slate-800 mb-1">
            {config.message}
          </h3>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between px-4 py-3 bg-white/70 rounded-lg">
          <span className="text-sm text-slate-500">Ticket ID</span>
          <span className="text-sm font-mono font-[500] text-slate-800">{ticket.ticketNumber}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-white/70 rounded-lg">
          <span className="text-sm text-slate-500">Type</span>
          <span className="text-sm font-[500] text-slate-800">{ticket.ticketType}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-white/70 rounded-lg">
          <span className="text-sm text-slate-500">Wristband</span>
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border-2 border-white shadow-sm"
              style={{ backgroundColor: ticket.wristbandColor }}
            />
            <span className="text-sm font-mono text-slate-600">{ticket.wristbandColor}</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-white/70 rounded-lg">
          <span className="text-sm text-slate-500">Holder</span>
          <span className="text-sm font-[500] text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4" />
            {ticket.holderName}
          </span>
        </div>
      </div>

      {/* Check-in History */}
      {ticket.checkInHistory.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-[500] text-slate-700 mb-3">Check-in History</h4>
          <div className="space-y-2">
            {ticket.checkInHistory.map((log, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-2 bg-white/70 rounded-lg text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-[500] ${
                  log.isManual ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {log.isManual ? '🖐️ Manual' : '📱 Scanner'}
                </span>
                <span className="text-slate-600">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className="text-slate-500 text-xs">
                  {log.deviceName || log.verifiedBy}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Check-in Form */}
      {canCheckIn && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-[500] text-slate-700 mb-2">
              Reason for Manual Check-in (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Scanner malfunction, QR code damaged..."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              rows={3}
            />
          </div>

          <button
            onClick={() => onCheckIn(notes)}
            disabled={isCheckingIn}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-[500] transition-colors flex items-center justify-center gap-2"
          >
            {isCheckingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Check In Manually
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
