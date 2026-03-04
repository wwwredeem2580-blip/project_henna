'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle, Plus, Trash2, Sparkles, QrCode, Rotate3D, Minus } from 'lucide-react';
import { BDTIcon, LocationIcon } from './Icons';

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
                  <div className="space-y-4 w-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-wix-purple" />
                      <span className="text-xs font-[600] uppercase tracking-widest text-wix-text-dark">
                        Live Preview
                      </span>
                    </div>

                    <div className="relative w-full max-w-[350px] h-[180px] group cursor-pointer" onClick={handleFlip} style={{ perspective: '1000px' }}>
                      <motion.div
                        className="w-full h-full relative"
                        initial={false}
                        animate={{ rotateY: (isFlipped) ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Front Face */}
                        <div
                          className="absolute w-full h-full bg-white border border-gray-200 overflow-hidden shadow-lg"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="px-6 py-4 h-full flex flex-col justify-between relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-md font-[400] tracking-wide text-neutral-700">
                                  {ticketData.tier || 'Ticket Tier'}
                                </div>
                                <div className="text-neutral-400 font-[500] text-[10px] uppercase tracking-widest">
                                  {ticketData.name || 'Ticket Name'}
                                </div>
                                <div className="mt-2">
                                  <div className="text-neutral-400 font-[500] text-[10px] uppercase tracking-widest">
                                    {sameDay ? eventData?.startDate : `${eventData?.startDate} - ${eventData?.endDate}`}
                                  </div>
                                  <div className="text-neutral-400 font-[500] text-[10px] uppercase tracking-widest">
                                    {eventData?.startTime} - {eventData?.endTime}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-start">
                              {true && (
                                <>
                                <span className="text-xs text-slate-500 font-[300]">
                                  {ticketData.quantity > 0 ? `Only ${ticketData.quantity} tickets left` : 'Sold out'}
                                </span>
                                <span className="flex items-center text-md gap-1 mt-2 text-slate-500 font-[300]">
                                  <span className="text-xs">For </span>
                                  {ticketData.price === 0 ? (
                                      <span className="px-2 py-0.5 bg-[#d2f47c] text-black text-xs font-[600] uppercase tracking-wider">
                                        FREE
                                      </span>
                                  ) : (
                                    <>
                                      <BDTIcon className="text-xs"/>{ticketData.price}
                                    </>
                                  )}
                                </span>
                                </>
                              )}
                              <span className="flex items-center gap-1 text-xs text-slate-500 font-[300]">
                                <LocationIcon className="w-3"/> {eventData?.venue}
                              </span>
                            </div>
                            {true && (
                              <div className="absolute bottom-10 right-6 flex items-center gap-2" onClick={handleControlClick}>
                                <button 
                                  disabled={true}
                                  className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Minus size={12}/>
                                </button>
                                <span className="text-xs font-[400] text-neutral-500 min-w-[20px] text-center">{0}</span>
                                <button 
                                  disabled={true}
                                  className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus size={12}/>
                                </button>
                              </div>
                            )}

                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none" />
                            <div className="absolute top-4 right-4 text-brand-400 opacity-50">
                              <Rotate3D size={16} />
                            </div>
                            
                            <div className="absolute bottom-18 right-6 text-brand-400/20">
                              <QrCode size={36} />
                            </div>
                          </div>
                        </div>

                        {/* Back Face */}
                        <div
                          className="absolute w-full h-full bg-white border border-gray-200 text-neutral-600 overflow-hidden relative shadow-lg"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <div className="px-6 py-4 h-full flex flex-col gap-6 relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-md font-[400] flex items-center gap-2 tracking-wide text-neutral-700">
                                  <Sparkles size={16} className='text-wix-purple' strokeWidth={1}/>
                                  Benefits
                                </div>
                                <div className="text-neutral-400 font-[500] text-[10px] uppercase tracking-widest">
                                  {ticketData.name}
                                </div>
                              </div>
                            </div>

                            <div className="flex text-[12px] flex-col items-start">
                              {ticketData.benefits.length > 0 ? (
                                ticketData.benefits.map((benefit, index) => (
                                  <div key={index} className='flex items-center gap-2'>
                                    <CheckCircle size={12} className='text-brand-500' strokeWidth={1}/>
                                    <span className='line-clamp-1'>{benefit}</span>
                                  </div>
                                )).slice(0, 3)
                              ) : (
                                <span className='text-xs text-slate-500 font-[300]'>No benefits</span>
                              )}
                              {ticketData.benefits.length > 3 && (
                                <button className='text-xs text-brand-500 font-[300] mt-2 hover:underline'>
                                  See more...
                                </button>
                              )}
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none" />
                            <div className="absolute top-4 right-4 text-brand-400 opacity-50">
                              <Rotate3D size={16} />
                            </div>
                            
                            <div className="absolute bottom-18 right-6 text-brand-400/20">
                              <QrCode size={36} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
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
