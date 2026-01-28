'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ChevronLeft, Sparkles, Building2, Phone, ShieldCheck, ArrowRight, CheckCircle2, Globe, Upload, Ticket, Trash, Edit, Plus } from 'lucide-react';
import { authService } from '@/lib/api/auth';
import { useNotification } from '@/lib/context/notification';
import { businessInfoSchema, companyDetailsSchema, personalInfoSchema } from '@/schema/auth.schema';
import { TicketCard } from '@/components/ui/TicketCard';
import { TicketConfigurator } from '@/components/ui/TicketConfigurator';

interface RegisterProps {
  onSuccess: () => void;
  onGoBack: () => void;
}

type Step = 'basic' | 'details' | 'logistics' | 'verification' | 'tickets' | 'platform';
const eventCategory = ['concert', 'sports', 'conference', 'festival', 'theater', 'comedy', 'networking', 'workshop', 'other'];
const venueType = ['indoor', 'outdoor', 'hybrid'];
interface document {
  type: string;
  url: string;
  filename: string;
  objectKey: string;
}

interface ticket {
 name: string;
  price: {
    amount: number;
    currency: string;
  },
  quantity: number,
  // Visual customization
  wristbandColor: string,
  // Metadata
  isVisible: boolean,
  isActive: boolean,
  benefits: string[],
  tier: string, 
}

interface FormData {
  title: string;
  tagline: string;
  category: string;
  subCategory: string[];
  media: {
    coverImage: {
      url: string;
      alt: string;
      thumbnailUrl: string;
    }
  };
  description: string;
  schedule: {
    startDate: string;
    endDate: string;
    isMultiDay: boolean;
    timezone: string;
    doors: string;
    type: 'single' | 'multiple';
    sessions: any[];
  };
  venue: {
    name: string;
    address: {
      street: string;
      city: string;
      country: string;
    };
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
    capacity: number;
    type: 'indoor' | 'outdoor' | 'hybrid';
  };
  verification: {
    documents: document[];
  };
  tickets: ticket[];
  platform: {
    terms: {
      termsAccepted: boolean;
      legalPermissionAccepted: boolean;
      platformTermsAccepted: boolean;
    }
  };
}

export const CreateEvent: React.FC<RegisterProps> = ({ onSuccess, onGoBack }) => {
  const { showNotification } = useNotification();
  const [step, setStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const companyType = ['organizer', 'venue_owner', 'representative', 'artist'];
  const [formData, setFormData] = useState<FormData>({
    title: '',
    tagline: '',
    category: '',
    subCategory: [],
    media: {
      coverImage: {
        url: '',
        alt: '',
        thumbnailUrl: '',
      }
    },
    description: '',
    schedule: {
      startDate: '',
      endDate: '',
      isMultiDay: false,
      timezone: '',
      doors: '',
      type: 'single',
      sessions: [],
    },
    venue: {
      name: '',
      address: {
        street: '',
        city: '',
        country: '',
      },
      coordinates: {
        type: 'Point',
        coordinates: [0, 0],
      },
      capacity: 0,
      type: 'indoor'
    },
    verification: {
      documents: []
    },
    tickets: [],
    platform: {
      terms: {
        termsAccepted: false,
        legalPermissionAccepted: false,
        platformTermsAccepted: false,
      }
    },
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // const validateStep = (currentStep: Step): boolean => {
  //   try {
  //     let result;
      
  //     if (currentStep === 'basic') {
  //       result = stepBasicsSchema.safeParse(formData);
  //     } else if (currentStep === 'details') {
  //       result = stepDetailsSchema.safeParse(formData);
  //     } else if (currentStep === 'logistics') {
  //       result = stepLogisticsSchema.safeParse(formData);
  //     } else if (currentStep === 'verification') {
  //       result = stepVerifySchema.safeParse(formData);
  //     } else if (currentStep === 'tickets') {
  //       result = stepTicketsSchema.safeParse(formData);
  //     } else if (currentStep === 'review') {
  //       result = stepReviewSchema.safeParse(formData);
  //     }

  //     if (result && !result.success) {
  //       const newErrors: Record<string, string> = {};
  //       result.error.issues.forEach((err: any) => {
  //         newErrors[err.path[0]] = err.message;
  //       });
  //       setErrors(newErrors);
  //       return false;
  //     }
      
  //     setErrors({});
  //     return true;
  //   } catch (error: any) {
  //     console.error('Validation error:', error);
  //     return false;
  //   }
  // };

  const handleNext = (nextStep: Step) => {
    // if (validateStep(step)) {
      setStep(nextStep);
    // }
  };

  const handleBack = () => {
    if (step === 'basic') {
      onGoBack();
    } else if (step === 'details') {
      setStep('basic');
    } else if (step === 'logistics') {
      setStep('details');
    } else if (step === 'verification') {
      setStep('logistics');
    } else if (step === 'tickets') {
      setStep('verification');
    } else if (step === 'platform') {
      setStep('tickets');
    } else {
      setStep('platform');
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-0 sm:p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] -z-10 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[80px] -z-10 opacity-50" />

      <motion.div
        layout
        className="w-full max-w-[500px] bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-100/50"
      >
        <div className="mb-12 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group font-[400]"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            {step === 'basic' ? 'Back' : 'Previous Step'}
          </button>

          <div className="flex gap-2">
            {(['basic', 'details', 'logistics', 'verification', 'tickets', 'platform'] as Step[]).map((s) => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === s ? 'bg-brand-500' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Business Information */}
          {step === 'basic' && (
            <motion.div key="basic" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 1: Basic Information</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Basic Information</h2>
                <p className="text-gray-500 text-sm sm:text-base font-[300]">How should we identify your event?</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Event Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {eventCategory.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => updateField('category', category)}
                      className={`px-3 py-2 text-sm sm:text-base rounded-lg border-1 sm:border-2 transition-all ${
                        formData.category === category
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
                {errors.companySize && <p className="text-xs text-red-500 ml-1">{errors.companySize}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                />
                {errors.tagline && <p className="text-xs text-red-500">{errors.tagline}</p>}
              </div>

              <button
                onClick={() => handleNext('details')}
                className="w-full bg-brand-500 text-white font-[600] py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Next: Event Details
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Company Details */}
          {step === 'details' && (
            <motion.div key="details" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 2: Event Details</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Event Details</h2>
                <p className="text-gray-500 text-sm sm:text-base font-[300]">Tell us about your event more</p>
              </div>

              <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-4 hover:border-brand-300 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-brand-600 transition-colors">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="font-[500] text-neutral-800">Upload Event Cover Image</p>
                  <p className="text-sm text-neutral-500">JPG or PNG (Max 5MB)</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

              <button
                onClick={() => handleNext('logistics')}
                className="w-full bg-brand-500 text-white font-[600] py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Next: Event Setup
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 3: Logistics */}
          {step === 'logistics' && (
            <motion.div key="logistics" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 3: Event Setup</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Event Setup</h2>
                <p className="text-gray-500 text-sm sm:text-base font-[300]">Setup your event logistics</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Venue Name *</label>
                  <input
                    type="text"
                    value={formData.venue.name}
                    onChange={(e) => updateField('venue[name]', e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors.venue?.name && <p className="text-xs text-red-500">{errors.venue?.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Venue Capacity *</label>
                  <input
                    type="text"
                    value={formData.venue.capacity}
                    onChange={(e) => updateField('venue[capacity]', e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors.venue?.capacity && <p className="text-xs text-red-500">{errors.venue?.capacity}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Venue Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {venueType.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField('venue.type', type)}
                      className={`px-3 py-2 text-sm sm:text-base rounded-lg border-1 sm:border-2 transition-all ${
                        formData.venue?.type === type
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
                {errors.venue?.type && <p className="text-xs text-red-500 ml-1">{errors.venue?.type}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Venue Street *</label>
                  <input
                    type="text"
                    value={formData.venue.street}
                    onChange={(e) => updateField('venue[street]', e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors.venue?.street && <p className="text-xs text-red-500">{errors.venue?.street}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Venue City *</label>
                  <input
                    type="text"
                    value={formData.venue.city}
                    onChange={(e) => updateField('venue[city]', e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors.venue?.city && <p className="text-xs text-red-500">{errors.venue?.city}</p>}
                </div>
              </div>

              <button
                onClick={() => handleNext('verification')}
                className="w-full bg-brand-500 text-white font-[600] py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Next: Verification
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 4: Verification */}
          {step === 'verification' && (
            <motion.div key="verification" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 4: Verification</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Verification</h2>
                <p className="text-gray-500 text-sm sm:text-base font-[300]">Help us to keep the platform safe for everyone</p>
              </div>

              <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-4 hover:border-brand-300 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-brand-600 transition-colors">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="font-[500] text-neutral-800">Upload Verification Documents</p>
                  <p className="text-sm text-neutral-500">PDF, JPG or PNG (Max 5MB)</p>
                </div>
              </div>

              <button
                onClick={() => handleNext('tickets')}
                className="w-full bg-brand-500 text-white font-[600] py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Next: Setup Tickets
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 5: Tickets */}
          {step === 'tickets' && (
            <motion.div key="tickets" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 5: Tickets</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Setup Tickets</h2>
                <p className="text-gray-500 text-sm sm:text-base font-[300]">Setup your tickets so people can engage</p>
              </div>

              {/* Capacity Overview */}
              <div className="p-0 pb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-4">
                      <div className='h-7 sm:h-8 md:h-9 lg:h-10 w-[3px] bg-brand-400'></div>
                      <p className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-[300] tracking-wider text-gray-800">
                        0 <span className="text-[10px] font-[500] text-gray-400 uppercase tracking-[0.1em]">out of</span> 100
                      </p>
                    </div>
                    <p className="text-[10px] font-[300] text-gray-400 uppercase tracking-[0.2em] mt-2">
                      Total Capacity
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 border-brand-100 rounded-full border`}>
                    <div className={`w-2 h-2 rounded-full bg-brand-500`} />
                    <span className="text-[10px] font-[400] uppercase tracking-widest">
                      0%
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-tr-sm rounded-bl-sm overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 bg-indigo-500`}
                    style={{ width: `${Math.min(21, 100)}%` }}
                  ></div>
                </div>
              </div>
              {/*Tickets*/}
              <section className='space-y-6'>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl md:text-xl lg:text-xl font-[300] text-neutral-700 leading-[0.9] tracking-tight">
                    Created Tickets
                  </h2>
                  <button title="Add New Ticket" className="text-slate-500 font-[600] text-[10px] uppercase tracking-widest hover:text-brand-500 hover:scale-120 transition-all">
                    <Plus size={16} />
                  </button>
                </div>
                <AnimatePresence>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="max-w-full pb-6 overflow-x-auto">
                      <div className="flex gap-4">
                        {[{eventDate: '2026-01-28', validUntil: '2026-01-28', venueAddress: 'Venue Address', eventVenue: 'Event Venue', ticketType: 'General Admission', eventTitle: 'Event Title', price: 100, _id: '123', ticketNumber: '123', qrCodeUrl: 'https://example.com/qr-code', ticketTheme: {benefits: ['Benefit 1', 'Benefit 2']}}].map((ticket) => {
                          const ticketEventDate = new Date(ticket.eventDate);
                          const ticketEndDate = new Date(ticket.validUntil);
                          
                          return (
                            <div key={ticket._id} className="min-w-[300px] w-[300px]">
                              <TicketCard ticket={{
                                _id: ticket._id,
                                tier: ticket.ticketType,
                                name: ticket.eventTitle,
                                controls: false,
                                startDate: ticketEventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                                endDate: ticketEndDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                                startTime: ticketEventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                                endTime: ticketEndDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                                price: ticket.price,
                                quantity: 1,
                                benefits: ticket.ticketTheme?.benefits || [
                                  'Access to event',
                                  'Dedicated entrance',
                                ],
                                venue: `${ticket.eventVenue}, ${ticket.venueAddress}`,
                                onClick: () => {},
                              }}
                              />
                              <div className="flex text-xs font-[400] text-slate-500 items-center gap-2 mt-2 justify-center">
                                <button 
                                  className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                                >
                                  <Edit size={12} />
                                  Edit
                                </button>
                                <button 
                                  className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                                >
                                  <Trash size={12} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </section>

              {/*Ticket Configurator*/}
              <section>
                <TicketConfigurator ticket={
                  {
                  _id: '123',
                  tier: 'General Admission',
                  name: 'Event Title',
                  controls: true,
                  startDate: '2026-01-28',
                  endDate: '2026-01-28',
                  startTime: '10:00 AM',
                  endTime: '11:00 AM',
                  price: 100,
                  quantity: 1,
                  benefits: [
                    'Access to event',
                    'Dedicated entrance',
                  ],
                  venue: 'Venue Address',
                  onClick: () => {},
                }}/>
              </section>


              <button
                onClick={() => handleNext('platform')}
                className="w-full bg-brand-500 text-white font-[600] py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Next: Platform Policy
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 6: Platform */}
          {step === 'platform' && (
            <motion.div key="platform" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 6: Platform Policy</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Platform Policy</h2>
                <p className="text-gray-500 text-sm sm:text-base font-[300]">Please Review your Event and our Platform Policy</p>
              </div>

              <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-4 hover:border-brand-300 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-brand-600 transition-colors">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="font-[500] text-neutral-800">Upload Verification Documents</p>
                  <p className="text-sm text-neutral-500">PDF, JPG or PNG (Max 5MB)</p>
                </div>
              </div>

              <button
                onClick={onSuccess}
                className="w-full bg-brand-500 text-white font-[600] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
              >
                Create Event
                <CheckCircle2 size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
