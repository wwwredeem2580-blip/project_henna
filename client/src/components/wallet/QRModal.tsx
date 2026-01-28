'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, QrCode as QrCodeIcon } from 'lucide-react';

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-tr-xl rounded-bl-xl shadow-2xl max-w-[350px] w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Content */}
              <div className="p-6 space-y-6">

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-2xl blur-xl"></div>
                    <div className="relative bg-white p-6 rounded-tr-xl rounded-bl-xl border-2 border-slate-100">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-600 font-[300] text-center">
                    Present this QR code at the event entrance for check-in
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onDownload}
                    className="flex-1 text-xs flex items-center justify-center gap-2 bg-brand-500 text-white py-3 rounded-tr-lg rounded-bl-lg font-[400] hover:bg-brand-600 transition-all"
                  >
                    <Download size={12} />
                    Download QR
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 text-xs bg-slate-100 text-slate-700 py-3 rounded-tr-lg rounded-bl-lg font-[400] hover:bg-slate-200 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
