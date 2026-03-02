'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  ticketNumber: string;
  eventTitle: string;
  ticketType: string;
  onDownload: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  qrCodeUrl,
  ticketNumber,
  eventTitle,
  ticketType,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[1001] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="bg-white border-2 border-wix-text-dark max-w-[360px] w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b-2 border-wix-text-dark bg-wix-text-dark">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">
                    Entry Pass
                  </div>
                  <div className="text-[14px] font-semibold text-white line-clamp-1">
                    {eventTitle}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 border border-white/30 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code */}
              <div className="flex justify-center px-8 pt-8 pb-5 bg-wix-gray-bg">
                <div className="bg-white border-2 border-wix-text-dark p-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              </div>

              {/* Ticket meta */}
              <div className="px-6 pb-5 bg-wix-gray-bg flex flex-col items-center gap-1 text-center">
                <div className="text-[11px] font-black uppercase tracking-widest text-wix-text-muted">
                  Ticket #{ticketNumber}
                </div>
                {ticketType && (
                  <div className="text-[11px] font-black uppercase tracking-widest text-wix-text-muted">
                    {ticketType}
                  </div>
                )}
                <p className="text-[11px] text-wix-text-muted mt-1 leading-snug">
                  Present this QR code at the event entrance for check-in.
                </p>
              </div>

              {/* Actions */}
              <div className="flex border-t-2 border-wix-text-dark">
                <button
                  onClick={onDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-4 text-[12px] font-black uppercase tracking-widest bg-wix-text-dark text-white hover:bg-wix-purple transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <div className="w-px bg-wix-text-dark" />
                <button
                  onClick={onClose}
                  className="flex-1 py-4 text-[12px] font-black uppercase tracking-widest text-wix-text-dark hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
