'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle, Plus, Trash2, Sparkles, QrCode, Rotate3D, Minus } from 'lucide-react';
import { BDTIcon, LocationIcon } from './Icons';

/* ─── SVG Icons ─── */
const ChipIcon = () => (
  <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="38" height="28" rx="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 10H10V20H1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M39 10H30V20H39" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M15 1V30" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M25 1V30" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M15 15H25" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const ContactlessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 5.5a10 10 0 0 1 0 13"/>
    <path d="M12.5 7.5a6 6 0 0 1 0 9"/>
    <path d="M16.5 9.5a2 2 0 0 1 0 5"/>
  </svg>
);

interface TicketData {
  name: string;
  tier: string;
  price: number;
  quantity: number;
  wristbandColor: string;
  benefits: string[];
  isVisible?: boolean;
  isActive?: boolean;
}

interface TicketConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: TicketData) => void;
  eventData?: {
    title: string;
    venue: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  editingTicket?: TicketData | null;
  validationContext?: {
    eventStatus?: string;
    existingTicket?: {
      price: number;
      sold: number;
      reserved: number;
      benefits: string[];
    };
  };
}

type Step = 'details' | 'benefits';

const WRISTBAND_COLORS = [
  { name: 'Purple', value: '#9333ea' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
];

export const TicketConfiguratorModal: React.FC<TicketConfiguratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eventData,
  editingTicket,
  validationContext,
}) => {
  const [step, setStep] = useState<Step>('details');
  const [newBenefit, setNewBenefit] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    price?: string;
    quantity?: string;
    benefits?: string;
  }>({});
  
  const [ticketData, setTicketData] = useState<TicketData>(
    editingTicket || {
      name: '',
      tier: '',
      price: 0,
      quantity: 0,
      wristbandColor: WRISTBAND_COLORS[0].value,
      benefits: [],
      isVisible: true,
      isActive: true,
    }
  );

  // Update ticketData when editingTicket changes
  useEffect(() => {
    if (editingTicket) {
      setTicketData(editingTicket);
      setStep('details'); // Reset to first step when editing
    } else {
      // Reset to default when creating new ticket
      setTicketData({
        name: '',
        tier: '',
        price: 0,
        quantity: 0,
        wristbandColor: WRISTBAND_COLORS[0].value,
        benefits: [],
        isVisible: true,
        isActive: true,
      });
      setStep('details');
    }
    setValidationErrors({}); // Clear errors when ticket changes
  }, [editingTicket, isOpen]); // Also depend on isOpen to reset when modal opens

  // Real-time validation
  useEffect(() => {
    if (!validationContext?.existingTicket) {
      setValidationErrors({});
      return;
    }

    const errors: typeof validationErrors = {};
    const { existingTicket, eventStatus } = validationContext;
    const soldCount = existingTicket.sold || 0;
    const reservedCount = existingTicket.reserved || 0;
    const totalCommitted = soldCount + reservedCount;

    // Only validate for published/live events with sales
    if ((eventStatus === 'published' || eventStatus === 'live') && totalCommitted > 0) {
      // Quantity validation
      if (ticketData.quantity < totalCommitted) {
        errors.quantity = `Cannot set quantity below ${totalCommitted} (${soldCount} sold + ${reservedCount} reserved)`;
      }

      // Price validation
      if (ticketData.price < existingTicket.price) {
        if (totalCommitted >= 10) {
          errors.price = `Cannot lower price with ${totalCommitted}+ sales. Contact support for assistance.`;
        } else if (totalCommitted > 0) {
          const refundAmount = (existingTicket.price - ticketData.price) * totalCommitted;
          errors.price = `⚠️ Reducing price will trigger BDT ${refundAmount} in refunds to ${totalCommitted} buyers (deducted from your payout)`;
        }
      }

      // Benefits validation
      const existingBenefits = existingTicket.benefits || [];
      const newBenefits = ticketData.benefits || [];
      const removedBenefits = existingBenefits.filter(b => !newBenefits.includes(b));
      
      if (removedBenefits.length > 0) {
        errors.benefits = `Cannot remove benefits: "${removedBenefits.join('", "')}" - ${soldCount} tickets already sold with these benefits`;
      }
    }

    setValidationErrors(errors);
  }, [ticketData.price, ticketData.quantity, ticketData.benefits, validationContext]);


  const updateField = (field: keyof TicketData, value: any) => {
    setTicketData(prev => ({ ...prev, [field]: value }));
  };

  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleControlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      updateField('benefits', [...ticketData.benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    updateField('benefits', ticketData.benefits.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(ticketData);
    onClose();
    // Reset form
    setTicketData({
      name: '',
      tier: '',
      price: 0,
      quantity: 0,
      wristbandColor: WRISTBAND_COLORS[0].value,
      benefits: [],
    });
    setStep('details');
  };

  const handleClose = () => {
    onClose();
    setStep('details');
  };

  const sameDay = eventData?.startDate === eventData?.endDate;

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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-300 shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-[300] text-slate-700">
                    {editingTicket ? 'Edit Ticket' : 'Create New Ticket'}
                  </h2>
                  <p className="text-xs text-slate-500 font-[300] mt-1">
                    {step === 'details' ? 'Configure ticket details' : 'Add ticket benefits'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Content - Split Layout on Large Screens */}
              <div className="flex flex-col lg:flex-row lg:h-[350px]">
                {/* Left Side - Editor */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Ticket Details */}
                    {step === 'details' && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-[500] text-neutral-600 ml-1">Ticket Name</label>
                            <input
                              type="text"
                              value={ticketData.name}
                              onChange={(e) => updateField('name', e.target.value)}
                              placeholder="Standard"
                              className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-black outline-none transition-all text-[15px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-[500] text-neutral-600 ml-1">Tier</label>
                            <input
                              type="text"
                              value={ticketData.tier}
                              onChange={(e) => updateField('tier', e.target.value)}
                              placeholder="Basic"
                              className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-black outline-none transition-all text-[15px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-[500] text-neutral-600 ml-1">Price (BDT)</label>
                            <input
                              value={ticketData.price}
                              onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                              className={`w-full px-4 py-2 bg-white border outline-none transition-all text-[15px] ${
                                validationErrors.price
                                  ? validationErrors.price.includes('⚠️')
                                    ? 'border-amber-400 focus:border-amber-500'
                                    : 'border-red-400 focus:border-red-500'
                                  : 'border-gray-300 focus:border-black'
                              }`}
                            />
                            {validationErrors.price && (
                              <p className={`text-xs ml-1 ${
                                validationErrors.price.includes('⚠️') ? 'text-amber-600' : 'text-red-500'
                              }`}>
                                {validationErrors.price}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-[500] text-neutral-600 ml-1">Quantity</label>
                            <input
                              value={ticketData.quantity}
                              onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                              className={`w-full px-4 py-2 bg-white border outline-none transition-all text-[15px] ${
                                validationErrors.quantity
                                  ? 'border-red-400 focus:border-red-500'
                                  : 'border-gray-300 focus:border-black'
                              }`}
                            />
                            {validationErrors.quantity && (
                              <p className="text-xs text-red-500 ml-1">{validationErrors.quantity}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-[500] text-neutral-600 ml-1">Wristband Color</label>
                          <div className="flex gap-3 pt-2">
                            {WRISTBAND_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => updateField('wristbandColor', color.value)}
                                className={`flex items-center gap-2 p-1.5 border transition-all ${
                                  ticketData.wristbandColor === color.value
                                    ? 'border-black bg-gray-100'
                                    : 'border-transparent hover:border-gray-300'
                                }`}
                              >
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: color.value }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Ticket Visibility and Sales Status Controls */}
                        <div className="space-y-3 pt-4 border-t max-h-[100px] lg:max-h-[350px] overflow-y-auto border-slate-200">
                          <p className="text-xs text-neutral-500 font-[500] uppercase tracking-wider">Ticket Controls</p>
                          
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <label className="text-sm font-[500] text-neutral-700">Visible on Event Page</label>
                              <p className="text-xs text-neutral-500 mt-0.5">Customers can see this ticket</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateField('isVisible', !ticketData.isVisible)}
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                ticketData.isVisible !== false ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                  ticketData.isVisible !== false ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <label className="text-sm font-[500] text-neutral-700">Sales Active</label>
                              <p className="text-xs text-neutral-500 mt-0.5">Customers can purchase this ticket</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateField('isActive', !ticketData.isActive)}
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                ticketData.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                  ticketData.isActive !== false ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Benefits */}
                    {step === 'benefits' && (
                      <motion.div
                        key="benefits"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-[500] text-slate-700">Add Benefits</label>
                          <div className="flex gap-2">
                            <input
                              value={newBenefit}
                              onChange={(e) => setNewBenefit(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                              placeholder="e.g., Access to VIP lounge"
                              className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-black outline-none transition-all text-[15px]"
                            />
                            <button
                              onClick={addBenefit}
                              className="px-4 py-2 bg-wix-text-dark text-white hover:bg-black transition-all flex items-center justify-center font-medium text-[13px]"
                            >
                              <Plus size={16} strokeWidth={2}/>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-[500] text-slate-700">
                            Benefits List ({ticketData.benefits.length})
                          </label>
                          {ticketData.benefits.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                              <Sparkles size={32} className="mx-auto text-slate-300 mb-2" />
                              <p className="text-sm text-slate-500 font-[300]">
                                No benefits added yet
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              {ticketData.benefits.map((benefit, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="flex items-center gap-3 p-3 bg-gray-50 border border-wix-border-light group"
                                >
                                  <CheckCircle size={16} className="text-wix-purple flex-shrink-0" />
                                  <span className="flex-1 text-sm text-slate-700">{benefit}</span>
                                  <button
                                    onClick={() => removeBenefit(index)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                  >
                                    <Trash2 size={14} className="text-red-500" />
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {validationErrors.benefits && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-xs text-red-600">{validationErrors.benefits}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Side - Live Preview (Hidden on Mobile) */}
                <div className="hidden lg:flex lg:w-[400px] p-6 bg-gray-50 items-center justify-center border-l border-gray-200">
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="flex items-center self-start gap-2 mb-4">
                      <Sparkles size={16} className="text-wix-purple" />
                      <span className="text-xs font-[600] uppercase tracking-widest text-wix-text-dark">
                        Live Preview
                      </span>
                    </div>

                    <div 
                      className="perspective-1000 w-full max-w-[380px] aspect-[1.586/1] cursor-pointer"
                      onClick={handleFlip}
                      title="Click to flip and see benefits"
                    >
                      <motion.div
                        className="w-full h-full relative"
                        initial={false}
                        animate={{ rotateY: (isFlipped) ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* FRONT */}
                        <div
                          className="absolute inset-0 w-full h-full backface-hidden p-5 sm:p-6 flex flex-col justify-between bg-white text-wix-text-dark border-2 border-black"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1.5">
                              <ChipIcon />
                              <div className="opacity-70"><ContactlessIcon /></div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <h3 className="text-[15px] font-black uppercase tracking-widest">{ticketData.tier || 'Standard'}</h3>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-wix-text-muted">Event Ticket</span>
                            </div>
                          </div>

                          <div className="text-[16px] sm:text-[20px] font-mono tracking-widest mt-auto mb-3 text-wix-text-muted">
                            Powered by Zenvy
                          </div>

                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase tracking-widest text-wix-text-muted mb-0.5">Valid for</span>
                              <span className="text-[13px] font-mono font-bold tracking-wide uppercase">Admit One</span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[9px] uppercase tracking-widest text-wix-text-muted mb-0.5">Price</span>
                              <span className="text-[16px] font-bold font-mono">
                                {ticketData.price === 0 ? 'FREE' : <><BDTIcon className="inline text-[13px]" />{ticketData.price.toLocaleString()}</>}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BACK */}
                        <div
                          className="absolute inset-0 w-full h-full backface-hidden border-2 border-black bg-white text-wix-text-dark flex flex-col rotate-y-180 overflow-hidden"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <div className="px-5 py-4 flex flex-col flex-1">
                            <div className="bg-gray-100 h-8 w-full flex items-center justify-end px-4 font-mono text-[11px] mb-4 text-gray-500">
                              VALID: {sameDay ? eventData?.startDate : `${eventData?.startDate} - ${eventData?.endDate}`}
                            </div>
                            <div className="text-[10px] text-wix-text-muted uppercase tracking-widest mb-2 border-b border-black pb-3">
                              Included Benefits
                            </div>
                            <ul className="flex flex-col gap-1.5 text-[12px] font-medium leading-snug text-wix-text-muted">
                              {ticketData.benefits.length > 0 ? (
                                <>
                                  {ticketData.benefits.slice(0, 5).map((b, i) => (
                                    <li key={i}>• {b}</li>
                                  ))}
                                  {ticketData.benefits.length > 5 && <li>• +{ticketData.benefits.length - 5} more</li>}
                                </>
                              ) : (
                                <li>• Event access</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    {/* Quantity preview */}
                    <div className="flex items-center justify-between border-2 border-black w-full max-w-[380px] bg-white h-[46px] overflow-hidden opacity-50 pointer-events-none mt-2">
                       <button className="w-12 h-full flex items-center justify-center text-xl font-medium">−</button>
                       <span className="font-mono text-[15px] font-bold">1</span>
                       <button className="w-12 h-full flex items-center justify-center text-xl font-medium">+</button>
                     </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex gap-2">
                  {(['details', 'benefits'] as Step[]).map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 w-8 transition-all duration-300 ${
                        step === s ? 'bg-wix-purple' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  {step === 'benefits' && (
                    <button
                      onClick={() => {setStep('details'); setIsFlipped(false)}}
                      className="px-4 py-2 text-[13px] font-medium bg-white border border-gray-300 text-slate-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                  )}
                  
                  {step === 'details' ? (
                    <button
                      onClick={() => {setStep('benefits'); setIsFlipped(true)}}
                      disabled={!ticketData.name || !ticketData.tier || ticketData.price < 0 || ticketData.quantity <= 0}
                      className="px-4 py-2 text-[13px] font-medium bg-wix-text-dark text-white hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Benefits
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={
                        !!validationErrors.quantity || 
                        !!validationErrors.benefits || 
                        (!!validationErrors.price && !validationErrors.price.includes('⚠️'))
                      }
                      className="px-4 py-2 text-[13px] font-medium bg-wix-text-dark text-white hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      Save Ticket
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
