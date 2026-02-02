import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description?: string;
  type: 'input' | 'confirm';
  inputPlaceholder?: string;
  confirmText?: string;
  intent?: 'danger' | 'primary' | 'neutral';
  loading?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type,
  inputPlaceholder,
  confirmText = 'Confirm',
  intent = 'primary',
  loading = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  const handleConfirm = () => {
    if (type === 'input' && !inputValue.trim()) return;
    onConfirm(inputValue);
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  };

  const getButtonColor = () => {
    switch (intent) {
      case 'danger': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'neutral': return 'bg-slate-800 hover:bg-slate-900 text-white';
      default: return 'bg-brand-500 hover:bg-brand-600 text-white';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={!loading ? onClose : undefined}
          />

          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="p-6 pb-2 flex justify-between items-start">
              <div className="flex items-center gap-3">
                {intent === 'danger' && (
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <AlertTriangle size={20} />
                  </div>
                )}
                 {intent !== 'danger' && (
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                    <CheckCircle2 size={20} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                </div>
              </div>
              <button 
                onClick={onClose} 
                disabled={loading}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {description && (
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  {description}
                </p>
              )}

              {type === 'input' && (
                <div className="space-y-2">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={inputPlaceholder}
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none placeholder:text-slate-400"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 text-right">
                    {inputValue.length} characters
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || (type === 'input' && !inputValue.trim())}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm ${getButtonColor()} ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
