'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ChevronLeft, Sparkles, Building2, Phone, ShieldCheck, ArrowRight, CheckCircle2, Globe, Upload, Ticket, Trash, Edit, Plus, Calendar, Clock10, Save } from 'lucide-react';
import { authService } from '@/lib/api/auth';
import { eventsService } from '@/lib/api/events';
import { useNotification } from '@/lib/context/notification';
import { businessInfoSchema, companyDetailsSchema, personalInfoSchema } from '@/schema/auth.schema';
import { TicketCard } from '@/components/ui/TicketCard';
import { TicketConfiguratorModal } from '@/components/ui/TicketConfiguratorModal';
import { BDTIcon } from '@/components/ui/Icons';
import { formatDate, formatTime } from '@/lib/utils';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { DocumentUploader } from '@/components/ui/DocumentUploader';
import { ScheduleBuilder } from '@/components/ui/ScheduleBuilder';
import { DateInput } from '@/components/ui/DateInput';
import { TimeInput } from '@/components/ui/TimeInput';
import { 
  basicInfoSchema, 
  eventDetailsSchema, 
  venueSchema,
  scheduleSchema,
  logisticsSchema, 
  verificationSchema, 
  ticketsStepSchema,
  platformSchema,
  validateTicketCapacity,
  validateUniqueTicketNames
} from '@/schema/event.schema';

interface RegisterProps {
  onSuccess: () => void;
  onGoBack: () => void;
}

type Step = 'basic' | 'details' | 'venue' | 'schedule' | 'verification' | 'tickets' | 'platform';
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
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);
  const [scheduleModalState, setScheduleModalState] = useState<'date' | 'start-time' | 'end-time' | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const companyType = ['organizer', 'venue_owner', 'representative', 'artist'];
  const [formData, setFormData] = useState<FormData>({
    title: '',
    tagline: '',
    category: 'concert',
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
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      isMultiDay: false,
      timezone: 'Asia/Dhaka',
      doors: '10:00 AM',
      type: 'single',
      sessions: [],
    },
    venue: {
      name: '',
      address: {
        street: '',
        city: '',
      },
      coordinates: {
        type: 'Point',
        coordinates: [0, 0],
      },
      capacity: 100,
      type: 'indoor'
    },
    verification: {
      documents: []
    },
    tickets: [],
    platform: {
      terms: {
        termsAccepted: true,
        legalPermissionAccepted: true,
        platformTermsAccepted: true,
      }
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get('draftId');
    if (draftId) {
      setDraftId(draftId);
    }
  }, []);

  useEffect(() => {
    if (draftId) {
      getDraft();
    }
  }, [draftId]);

  const getDraft = async () => {
    if (draftId) {
      const draft = await eventsService.getDraft(draftId);
      if (draft) {
        for (const key in formData) {
          if (draft[key] !== undefined) {
            setFormData(prev => ({
              ...prev,
              [key]: draft[key]
            }));
          }
        }
      }
    }
  }

  // Filter out empty strings, arrays, and objects
  const filterEmptyValues = (obj: any): any => {
    if (Array.isArray(obj)) {
      const filtered = obj.filter(item => {
        if (typeof item === 'string') return item.trim() !== '';
        if (Array.isArray(item)) return item.length > 0;
        if (typeof item === 'object' && item !== null) {
          const cleaned = filterEmptyValues(item);
          return cleaned && Object.keys(cleaned).length > 0;
        }
        return item !== null && item !== undefined;
      });
      return filtered.length > 0 ? filtered : undefined;
    }

    if (typeof obj === 'object' && obj !== null) {
      const filtered: any = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        
        // Skip empty strings, null, undefined
        if (value === '' || value === null || value === undefined) {
          return;
        }
        
        if (Array.isArray(value)) {
          const filteredArray = filterEmptyValues(value);
          if (filteredArray && filteredArray.length > 0) {
            filtered[key] = filteredArray;
          }
        } else if (typeof value === 'object') {
          const filteredObj = filterEmptyValues(value);
          if (filteredObj && Object.keys(filteredObj).length > 0) {
            filtered[key] = filteredObj;
          }
        } else {
          filtered[key] = value;
        }
      });
      return Object.keys(filtered).length > 0 ? filtered : undefined;
    }

    return obj;
  };

  // Manual save draft handler
  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // Filter out empty values before saving
      const cleanedData = filterEmptyValues(formData);
      
      if (draftId) {
        // Update existing draft
        await eventsService.updateDraft(draftId, cleanedData as any);
        showNotification('success', 'Draft Saved', 'Your event draft has been updated successfully');
      } else {
        // Create new draft
        const response = await eventsService.createDraft(cleanedData as any);
        setDraftId(response.eventId);
        
        // Update URL with draftId
        const url = new URL(window.location.href);
        url.searchParams.set('draftId', response.eventId);
        window.history.pushState({}, '', url.toString());
        
        showNotification('success', 'Draft Created', 'Your event draft has been saved successfully');
      }
    } catch (error: any) {
      showNotification('error', 'Save Failed', error.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateVenueField = (field: keyof typeof formData.venue, value: any) => {
    setFormData(prev => ({
      ...prev,
      venue: { ...prev.venue, [field]: value }
    }));
    if (errors[`venue.${field}`]) {
      setErrors(prev => ({ ...prev, [`venue.${field}`]: '' }));
    }
  };

  const updateVenueAddress = (field: keyof typeof formData.venue.address, value: string) => {
    setFormData(prev => ({
      ...prev,
      venue: {
        ...prev.venue,
        address: { ...prev.venue.address, [field]: value }
      }
    }));
    if (errors[`venue.address.${field}`]) {
      setErrors(prev => ({ ...prev, [`venue.address.${field}`]: '' }));
    }
  };

  const updateScheduleField = (field: keyof typeof formData.schedule, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [field]: value }
    }));
    if (errors[`schedule.${field}`]) {
      setErrors(prev => ({ ...prev, [`schedule.${field}`]: '' }));
    }
  };

  const validateStep = (currentStep: Step): boolean => {
    try {
      let result;
      const newErrors: Record<string, string> = {};
      
      if (currentStep === 'basic') {
        result = basicInfoSchema.safeParse({
          title: formData.title,
          tagline: formData.tagline,
          category: formData.category,
        });
      } else if (currentStep === 'details') {
        result = eventDetailsSchema.safeParse({
          description: formData.description,
          coverImage: formData.media?.coverImage?.url || '',
        });
      } else if (currentStep === 'venue') {
        result = venueSchema.safeParse({
          venue: {
            name: formData.venue.name,
            capacity: Number(formData.venue.capacity) || 0,
            address: {
              street: formData.venue.address.street || '',
              city: formData.venue.address.city || '',
              country: 'Bangladesh',
            },
          },
        });
      } else if(currentStep === 'schedule') {
        result = scheduleSchema.safeParse({
          schedule: {
            startDate: formData.schedule.startDate,
            endDate: formData.schedule.endDate,
            doors: formData.schedule.doors,
          },
        });
      } else if (currentStep === 'verification') {
        result = verificationSchema.safeParse({
          verification: formData.verification,
        });
      } else if (currentStep === 'tickets') {
        // Validate tickets
        result = ticketsStepSchema.safeParse({
          tickets: formData.tickets,
        });

        // Additional custom validations
        if (result && result.success) {
          // Check total capacity
          const capacityCheck = validateTicketCapacity(formData.tickets, formData.venue.capacity);
          if (!capacityCheck.valid) {
            newErrors.tickets = capacityCheck.error!;
            setErrors(newErrors);
            showNotification('error', 'Validation Error', capacityCheck.error!);
            return false;
          }

          // Check unique names
          const uniqueCheck = validateUniqueTicketNames(formData.tickets);
          if (!uniqueCheck.valid) {
            newErrors.tickets = uniqueCheck.error!;
            setErrors(newErrors);
            showNotification('error', 'Validation Error', uniqueCheck.error!);
            return false;
          }
        }
      } else if (currentStep === 'platform') {
        result = platformSchema.safeParse({
          termsAccepted: formData.platform.terms.termsAccepted,
          legalPermissionAccepted: formData.platform.terms.legalPermissionAccepted,
          platformTermsAccepted: formData.platform.terms.platformTermsAccepted,
        });
      }

      if (result && !result.success) {
        result.error.issues.forEach((err: any) => {
          const fieldPath = err.path.join('.');
          newErrors[fieldPath] = err.message;
        });
        setErrors(newErrors);
        
        // Show first error as notification
        const firstError = Object.values(newErrors)[0];
        showNotification('error', 'Validation Error', firstError);
        return false;
      }
      
      setErrors({});
      return true;
    } catch (error: any) {
      console.error('Validation error:', error);
      showNotification('error', 'Validation Error', 'An unexpected error occurred');
      return false;
    }
  };

  const handleNext = (nextStep: Step) => {
    if (validateStep(step)) {
      setStep(nextStep);
    }
  };

  const handleBack = () => {
    if (step === 'basic') {
      onGoBack();
    } else if (step === 'details') {
      setStep('basic');
    } else if (step === 'venue') {
      setStep('details');
    } else if (step === 'schedule') {
      setStep('venue');
    } else if (step === 'verification') {
      setStep('schedule');
    } else if (step === 'tickets') {
      setStep('verification');
    } else if (step === 'platform') {
      setStep('tickets');
    } else {
      setStep('platform');
    }
  };

  const handleAddTicket = () => {
    setEditingTicketIndex(null);
    setIsTicketModalOpen(true);
  };

  const handleEditTicket = (index: number) => {
    setEditingTicketIndex(index);
    setIsTicketModalOpen(true);
  };

  const handleDeleteTicket = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }));
    showNotification('success', 'Ticket Deleted', 'Ticket has been removed successfully');
  };

  const handleSaveTicket = (ticketData: any) => {
    if (editingTicketIndex !== null) {
      // Edit existing ticket
      setFormData(prev => ({
        ...prev,
        tickets: prev.tickets.map((t, i) => 
          i === editingTicketIndex 
            ? {
                name: ticketData.name,
                tier: ticketData.tier,
                price: { amount: ticketData.price, currency: 'BDT' },
                quantity: ticketData.quantity,
                wristbandColor: ticketData.wristbandColor,
                benefits: ticketData.benefits,
                isVisible: true,
                isActive: true,
              }
            : t
        )
      }));
      showNotification('success', 'Ticket Updated', 'Ticket has been updated successfully');
    } else {
      // Check capacity before adding new ticket
      const currentTotal = getTotalTicketsAllocated();
      const newTotal = currentTotal + ticketData.quantity;
      
      if (formData.venue.capacity > 0 && newTotal > formData.venue.capacity) {
        showNotification(
          'error', 
          'Capacity Exceeded', 
          `Cannot add ticket. Total tickets (${newTotal}) would exceed venue capacity (${formData.venue.capacity})`
        );
        return;
      }
      
      // Add new ticket
      setFormData(prev => ({
        ...prev,
        tickets: [...prev.tickets, {
          name: ticketData.name,
          tier: ticketData.tier,
          price: { amount: ticketData.price, currency: 'BDT' },
          quantity: ticketData.quantity,
          wristbandColor: ticketData.wristbandColor,
          benefits: ticketData.benefits,
          isVisible: true,
          isActive: true,
        }]
      }));
      showNotification('success', 'Ticket Created', 'New ticket has been added successfully');
    }
  };

  const getTotalTicketsAllocated = () => {
    return formData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  const getCapacityPercentage = () => {
    if (formData.venue.capacity === 0) return 0;
    return Math.min((getTotalTicketsAllocated() / formData.venue.capacity) * 100, 100);
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
        <div className="mb-12 text-xs sm:text-sm flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group font-[400]"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            {step === 'basic' ? 'Back' : 'Previous'}
          </button>

          <div className="flex gap-2">
            {(['basic', 'details', 'logistics', 'verification', 'tickets', 'platform'] as Step[]).map((s) => (
              <div key={s} className={`h-1.5 w-6 sm:w-8 rounded-full transition-all duration-500 ${step === s ? 'bg-brand-500' : 'bg-gray-100'}`} />
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
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Gala Night 2026"
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
                  value={formData.tagline || ''}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="Experience the magic of music"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                />
                {errors.tagline && <p className="text-xs text-red-500">{errors.tagline}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 bg-white text-xs text-brand-600 border-2 py-2 sm:py-3 px-3 border-brand-200 font-[500] rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleNext('details')}
                  className="flex-1 bg-brand-500 text-xs text-white font-[500] py-2 sm:py-3 px-3 rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                >
                  Details
                  <ArrowRight size={20} />
                </button>
              </div>
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


              <ImageUploader
                type="event_cover"
                maxSizeMB={5}
                acceptedFormats={['image/jpeg', 'image/png']}
                onUploadComplete={(url, fileId) => {
                  setFormData(prev => ({
                    ...prev,
                    media: {
                      ...prev.media,
                      coverImage: {
                        url,
                        alt: formData.title || 'Event cover image',
                        thumbnailUrl: url
                      }
                    }
                  }));
                }}
                onUploadError={(error) => {
                  setErrors(prev => ({ ...prev, coverImage: error }));
                }}
                currentImage={formData.media?.coverImage?.url || ''}
              />


              <div className="space-y-2">
                <label className="text-sm font-[500] text-neutral-700 ml-1">Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Event description"
                  className="w-full min-h-[150px] px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 bg-white text-xs text-brand-600 border-2 py-2 sm:py-3 px-3 border-brand-200 font-[500] rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleNext('venue')}
                  className="flex-1 bg-brand-500 text-xs text-white font-[500] py-2 sm:py-3 px-3 rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                >
                  Venue Setup
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Venue Setup */}
          {step === 'venue' && (
            <motion.div key="venue" {...stepVariants} className="space-y-6">
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
                    value={formData.venue.name || ''}
                    onChange={(e) => updateVenueField('name', e.target.value)}
                    placeholder="Grand Hotel"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors['venue.name'] && <p className="text-xs text-red-500">{errors['venue.name']}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Venue Capacity *</label>
                  <input
                    type="text"
                    value={formData.venue.capacity || ''}
                    onChange={(e) => updateVenueField('capacity', Number(e.target.value) || 0)}
                    placeholder="1000"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors['venue.capacity'] && <p className="text-xs text-red-500">{errors['venue.capacity']}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Venue Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {venueType.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateVenueField('type', type as 'indoor' | 'outdoor' | 'hybrid')}
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
                {errors['venue.type'] && <p className="text-xs text-red-500 ml-1">{errors['venue.type']}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Venue Street *</label>
                  <input
                    type="text"
                    value={formData?.venue?.address?.street || ''}
                    onChange={(e) => updateVenueAddress('street', e.target.value)}
                    placeholder="123 Main St"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors['venue.address.street'] && <p className="text-xs text-red-500">{errors['venue.address.street']}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Venue City *</label>
                  <input
                    type="text"
                    value={formData?.venue?.address?.city || ''}
                    onChange={(e) => updateVenueAddress('city', e.target.value)}
                    placeholder="Dhaka"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-purple-600 focus:bg-white outline-none transition-all"
                  />
                  {errors['venue.address.city'] && <p className="text-xs text-red-500">{errors['venue.address.city']}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 bg-white text-xs text-brand-600 border-2 py-2 sm:py-3 px-3 border-brand-200 font-[500] rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleNext('schedule')}
                  className="flex-1 bg-brand-500 text-xs text-white font-[500] py-2 sm:py-3 px-3 rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                >
                  Schedule
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Event Schedule */}
          {step === 'schedule' && (
            <motion.div key="schedule" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 4: Event Schedule</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Event Schedule</h2>
                <p className="text-gray-500 text-sm sm:text-base font-[300]">Set up your event dates and times</p>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => updateScheduleField('type', 'single')}
                  className={`px-4 py-2 rounded-lg text-sm font-[400] transition-all duration-200 ${
                    (formData.schedule?.type || 'single') === 'single'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Single Day Event
                </button>
                <button
                  type="button"
                  onClick={() => updateScheduleField('type', 'multiple')}
                  className={`px-4 py-2 rounded-lg text-sm font-[400] transition-all duration-200 ${
                    formData.schedule?.type === 'multiple'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Multi-Day Event
                </button>
              </div>

              {formData.schedule?.type === 'multiple' ? (
                <div className="space-y-2">
                  <ScheduleBuilder
                    sessions={formData.schedule?.sessions || []}
                    onChange={(sessions) => {
                      updateScheduleField('sessions', sessions);
                      if (sessions.length > 0) {
                        const sortedSessions = sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        updateScheduleField('startDate', sortedSessions[0].startTime);
                        updateScheduleField('endDate', sortedSessions[sortedSessions.length - 1].endTime);
                        updateScheduleField('isMultiDay', true);
                      }
                    }}
                  />
                  {errors['schedule.sessions'] && <p className="text-xs text-red-500 ml-1">{errors['schedule.sessions']}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <DateInput
                    label="Event Date"
                    value={formData.schedule.startDate || ''}
                    isOpen={scheduleModalState === 'date'}
                    onOpen={() => setScheduleModalState('date')}
                    onClose={() => setScheduleModalState(null)}
                    onChange={(val) => {
                      const date = new Date(val);
                      // Preserve time if it exists, otherwise set to 6 PM
                      if (formData.schedule.startDate) {
                        const oldDate = new Date(formData.schedule.startDate);
                        date.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0);
                      } else {
                        date.setHours(18, 0, 0, 0);
                      }
                      updateScheduleField('startDate', date.toISOString());
                      
                      // Update end date to same day, 3 hours later
                      const endDate = new Date(date);
                      if (formData.schedule.endDate) {
                        const oldEnd = new Date(formData.schedule.endDate);
                        endDate.setHours(oldEnd.getHours(), oldEnd.getMinutes(), 0, 0);
                      } else {
                        endDate.setHours(21, 0, 0, 0);
                      }
                      updateScheduleField('endDate', endDate.toISOString());
                      updateScheduleField('isMultiDay', false);
                      setScheduleModalState(null);
                    }}
                    minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                    error={!!errors['schedule.startDate']}
                  />
                  {errors['schedule.startDate'] && <p className="text-xs text-red-500 ml-1">{errors['schedule.startDate']}</p>}

                  <div className="grid grid-cols-2 gap-4">
                    <TimeInput
                      label="Start Time"
                      value={formData.schedule.startDate || ''}
                      isOpen={scheduleModalState === 'start-time'}
                      onOpen={() => setScheduleModalState('start-time')}
                      onClose={() => setScheduleModalState(null)}
                      onChange={(val) => {
                        updateScheduleField('startDate', val);
                        setScheduleModalState(null);
                      }}
                      error={!!errors['schedule.startDate']}
                    />

                    <TimeInput
                      label="End Time"
                      value={formData.schedule.endDate || ''}
                      isOpen={scheduleModalState === 'end-time'}
                      onOpen={() => setScheduleModalState('end-time')}
                      onClose={() => setScheduleModalState(null)}
                      onChange={(val) => {
                        updateScheduleField('endDate', val);
                        setScheduleModalState(null);
                      }}
                      minTime={formData.schedule.startDate ? new Date(new Date(formData.schedule.startDate).getTime() + 60 * 60 * 1000).toISOString() : undefined}
                      error={!!errors['schedule.endDate']}
                    />
                  </div>
                  {errors['schedule.endDate'] && <p className="text-xs text-red-500 ml-1">{errors['schedule.endDate']}</p>}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 bg-white text-xs text-brand-600 border-2 py-2 sm:py-3 px-3 border-brand-200 font-[500] rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleNext('verification')}
                  className="flex-1 bg-brand-500 text-xs text-white font-[500] py-2 sm:py-3 px-3 rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                >
                  Verification
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Verification */}
          {step === 'verification' && (
            <motion.div key="verification" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-brand-500" size={20} />
                  <span className="text-xs font-[600] uppercase tracking-widest text-brand-500">Step 5: Verification</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-[300] text-gray-900 mt-4 leading-[0.9] tracking-tight">Verification</h2>
                <p className="text-gray-500 text-sm sm:text-base font-[300]">Help us to keep the platform safe for everyone</p>
              </div>

              <DocumentUploader
                onUploadComplete={(uploadedFiles) => {
                  // Convert uploaded files to document objects
                  const documents = uploadedFiles.map((file) => ({
                    type: 'verification',
                    url: '', // Backblaze files don't have direct URLs
                    filename: file.filename,
                    objectKey: file.objectKey
                  }));
                  
                  setFormData(prev => ({
                    ...prev,
                    verification: {
                      ...prev.verification,
                      documents: documents
                    }
                  }));
                }}
                onUploadError={(error) => {
                  setErrors(prev => ({ ...prev, 'verification.documents': error }));
                }}
                maxFiles={5}
                maxSizeMB={5}
              />
              {errors['verification.documents'] && <p className="text-xs text-red-500 ml-1">{errors['verification.documents']}</p>}

              {/* Display uploaded documents */}
              {formData.verification?.documents && formData.verification.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-[500] text-neutral-700 ml-1">Uploaded Documents ({formData.verification.documents.length})</label>
                  <div className="space-y-2">
                    {formData.verification.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                          <Upload size={16} className="text-brand-500" />
                          <span className="text-sm text-gray-700">{doc.filename}</span>
                        </div>
                        <button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              verification: {
                                ...prev.verification,
                                documents: prev.verification.documents.filter((_, i) => i !== index)
                              }
                            }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 bg-white text-xs text-brand-600 border-2 py-2 sm:py-3 px-3 border-brand-200 font-[500] rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleNext('tickets')}
                  className="flex-1 bg-brand-500 text-xs text-white font-[500] py-2 sm:py-3 px-3 rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                >
                  Setup Tickets
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Tickets */}
          {step === 'tickets' && (
            <motion.div key="tickets" {...stepVariants} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="text-brand-500" size={20} />
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
                        {getTotalTicketsAllocated()} <span className="text-[10px] font-[500] text-gray-400 uppercase tracking-[0.1em]">out of</span> {formData.venue.capacity}
                      </p>
                    </div>
                    <p className="text-[10px] font-[300] text-gray-400 uppercase tracking-[0.2em] mt-2">
                      Total Capacity
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 ${
                    getCapacityPercentage() > 100 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand-50 text-brand-600 border-brand-100'
                  } rounded-full border`}>
                    <div className={`w-2 h-2 rounded-full ${getCapacityPercentage() > 100 ? 'bg-red-500' : 'bg-brand-500'}`} />
                    <span className="text-[10px] font-[400] uppercase tracking-widest">
                      {Math.round(getCapacityPercentage())}%
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-tr-sm rounded-bl-sm overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      getCapacityPercentage() > 100 ? 'bg-red-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(getCapacityPercentage(), 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Created Tickets */}
              <section className='space-y-6'>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl md:text-xl lg:text-xl font-[300] text-neutral-700 leading-[0.9] tracking-tight">
                    Created Tickets ({formData.tickets.length})
                  </h2>
                  <button 
                    onClick={handleAddTicket}
                    title="Add New Ticket" 
                    className="flex items-center gap-2 px-3 py-2 text-xs font-[500] text-brand-500 border border-brand-200 rounded-lg hover:bg-brand-50 transition-all"
                  >
                    <Plus size={14} />
                    Add Ticket
                  </button>
                </div>

                {formData.tickets.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl text-center">
                    <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-sm text-slate-500 font-[300] mb-4">
                      No tickets created yet
                    </p>
                    <button
                      onClick={handleAddTicket}
                      className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all text-sm font-[500]"
                    >
                      Create Your First Ticket
                    </button>
                  </div>
                ) : (
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
                          {formData.tickets.map((ticket, index) => {
                            const ticketEventDate = new Date(formData.schedule.startDate);
                            const ticketEndDate = new Date(formData.schedule.endDate);
                            
                            return (
                              <div key={index} className="min-w-[300px] w-[300px]">
                                <TicketCard ticket={{
                                  _id: `ticket-${index}`,
                                  tier: ticket.tier,
                                  name: ticket.name,
                                  controls: false,
                                  startDate: ticketEventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                                  endDate: ticketEndDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                                  startTime: formData.schedule.doors,
                                  endTime: formData.schedule.doors,
                                  price: ticket.price.amount,
                                  quantity: ticket.quantity,
                                  benefits: ticket.benefits,
                                  venue: `${formData.venue.name}, ${formData.venue.address.city}`,
                                  onClick: () => {},
                                }}
                                />
                                <div className="flex text-xs font-[400] text-slate-500 items-center gap-2 mt-2 justify-center">
                                  <button 
                                    onClick={() => handleEditTicket(index)}
                                    className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                                  >
                                    <Edit size={12} />
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTicket(index)}
                                    className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-red-300 text-red-500 px-2 py-1 rounded-sm"
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
                )}
              </section>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 bg-white text-xs text-brand-600 border-2 py-2 sm:py-3 px-3 border-brand-200 font-[500] rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleNext('platform')}
                  className="flex-1 bg-brand-500 text-xs text-white font-[500] py-2 sm:py-3 px-3 rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                >
                  Review
                  <ArrowRight size={20} />
                </button>
              </div>
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

              <div className="px-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-0 bg-slate-50 border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden cursor-pointer"
                >
                  <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                    <img
                      src={formData.media?.coverImage?.url || 'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                      alt={formData.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 ml-[-12px] mb-2">
                    </div>
                    <h2 className="text-lg font-[300] text-slate-900 tracking-tight truncate">{formData.title || "Event Title"}</h2>
                    <p className="text-xs text-slate-500 font-[300] line-clamp-2">{formData.tagline || formData.description || "Event Description"}</p>
                    <div className="flex flex-col gap-2 mt-2 font-[400] text-neutral-700">
                      <span className="flex items-center gap-1 text-xs ">
                        <Calendar size={12} strokeWidth={1}/>
                        {formatDate(formData.schedule.startDate || "Event Start Date")}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock10 size={12} strokeWidth={1}/>
                        {formatTime(formData.schedule.startDate || "Event Start Time")} - {formatTime(formData.schedule.endDate || "Event End Time")}
                      </span>
                    </div>
                    {/* Price */}
                    <div className="flex justify-between items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500 font-[300]">
                        {formData.venue?.address?.city || 'Location TBA'}
                      </span>
                      <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                        <span className="text-xs">From</span> <BDTIcon className="text-xs"/>{formData?.tickets[0]?.price?.amount || "0"}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                </motion.div>
              </div>

              <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 flex items-start gap-3">
                <div className="mt-0.5"><CheckCircle2 size={16} className="text-brand-600" /></div>
                <p className="text-xs text-brand-800 font-[400] leading-relaxed">
                  By clicking create, you agree to our event verification process, terms and conditions.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 bg-white text-xs text-brand-600 border-2 py-2 sm:py-3 px-3 border-brand-200 font-[500] rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      if (draftId) {
                        await eventsService.submitEvent(draftId, formData);
                        showNotification('success', 'Event submission!', 'Event submitted successfully!');
                        onSuccess();
                      } else {
                        showNotification('error', 'Event submission!', 'Please save draft first');
                      }
                    } catch (error: any) {
                      showNotification('error', 'Event submission!', error.message || 'Failed to submit event');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex-1 bg-brand-500 text-xs text-white font-[500] py-2 sm:py-3 px-3 rounded-tr-lg rounded-bl-lg flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                  <CheckCircle2 size={20} />
                </button>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ticket Configurator Modal */}
      <TicketConfiguratorModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setEditingTicketIndex(null);
        }}
        onSave={handleSaveTicket}
        eventData={{
          title: formData.title || 'Your Event',
          venue: `${formData.venue.name}, ${formData.venue.address?.city || ''}`,
          startDate: new Date(formData.schedule.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          endDate: new Date(formData.schedule.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          startTime: formData.schedule.doors,
          endTime: formData.schedule.doors,
        }}
        editingTicket={
          editingTicketIndex !== null && formData.tickets[editingTicketIndex]
            ? {
                name: formData.tickets[editingTicketIndex].name,
                tier: formData.tickets[editingTicketIndex].tier,
                price: formData.tickets[editingTicketIndex].price.amount,
                quantity: formData.tickets[editingTicketIndex].quantity,
                wristbandColor: formData.tickets[editingTicketIndex].wristbandColor,
                benefits: formData.tickets[editingTicketIndex].benefits,
              }
            : null
        }
      />
    </div>
  );
};
