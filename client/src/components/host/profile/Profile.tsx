'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ShoppingBag,
  Star,
  Trash2,
  UserCircle,
  HelpCircle,
  Plus,
  LogIn,
  UserPlus,
  PlusCircle,
  BarChart3,
  Ticket,
  DollarSign,
  CreditCard,
  MoreHorizontal,
  Loader2,
  Search,
  MessageSquare,
  Send,
  ChevronRight,
  Phone,
  ShieldCheck,
  Wallet,
  ChevronLeft,
  Smartphone,
  Landmark,
  ArrowUpRight,
  Upload,
  ArrowLeft,
  Pencil,
  Edit,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';
import { hostAnalyticsService, DashboardMetrics, HostOrder } from '@/lib/api/host-analytics';
import { hostEventsService } from '@/lib/api/host';

interface DashboardProps {
  onLogout: () => void;
}

import { Logo } from '@/components/shared/Logo';

import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';


import { PhoneVerification } from './PhoneVerification';
import { useNotification } from '@/lib/context/notification';

export interface PayoutConfig {
  type: 'bank' | 'bkash' | 'nagad' | null;
  details: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    branchName?: string;
    phoneNumber?: string;
  };
}

export default function Profile() {

  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editingPayoutType, setEditingPayoutType] = useState<'bank_transfer' | 'bkash' | 'nagad' | 'rocket' | null>(null);
  const [activeSettingsSection, setActiveSettingsSection] = useState('Phone Verification');
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();

  // Payment form state
  const [paymentFormData, setPaymentFormData] = useState({
    method: '',
    mobileNumber: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    branchName: '',
    routingNumber: '',
    swiftCode: ''
  });

  // Phone verification state
  const [verifyPhone, setVerifyPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await hostEventsService.getProfile();
        setProfile(data);
        
        // Initialize phone number
        if (data.user?.phoneNumber) {
          setVerifyPhone(data.user.phoneNumber);
        }

        // Pre-fill form if payment details exist
        if (data.paymentDetails) {
          setPaymentFormData({
            method: data.paymentDetails.method || '',
            mobileNumber: data.paymentDetails.mobileNumber || '',
            accountHolderName: data.paymentDetails.accountHolderName || '',
            bankName: data.paymentDetails.bankName || '',
            accountNumber: data.paymentDetails.accountNumber || '',
            branchName: data.paymentDetails.branchName || '',
            routingNumber: data.paymentDetails.routingNumber || '',
            swiftCode: data.paymentDetails.swiftCode || ''
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        setError(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleVerificationComplete = async () => {
    // Refresh profile to update verified status
    const updatedProfile = await hostEventsService.getProfile();
    setProfile(updatedProfile);
    setIsEditingPhone(false);
  };

  const handlePhoneEdit = () => {
    setIsEditingPhone(true);
  };

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setPaymentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form when changing payment type
  useEffect(() => {
    if (editingPayoutType) {
      setPaymentFormData(prev => ({
        ...prev,
        method: editingPayoutType
      }));
    }
  }, [editingPayoutType]);

  const handleSavePayout = async () => {
    try {
      setIsSaving(true);
      await hostEventsService.updatePaymentDetails(paymentFormData);
      
      // Refresh profile data
      const updatedProfile = await hostEventsService.getProfile();
      setProfile(updatedProfile);
      setEditingPayoutType(null);
    } catch (error: any) {
      console.error('Failed to save payment details:', error);
      showNotification('error', 'Payment details not saved', error?.response?.data?.message || 'Failed to save payment details')
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Profile</h1>
            <p className="text-sm text-slate-500 font-[300]">Manage your profile details like contact, payout methods, etc.</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
              <button title='Create Event' onClick={() => {router.push('/host/events/create')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Plus size={18}/></button>
              <button title='Analytics' onClick={() => {router.push('/host/analytics')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><BarChart3 size={18}/></button>
              <button title='Help' onClick={() => {router.push('/host/help')}} className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-10">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : 
          <div className="flex h-[calc(100vh-180px)] bg-white overflow-hidden flex-col md:flex-row">
            <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 flex-col bg-white ${isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 md:p-6 border-b border-slate-50">
                <h3 className="text-md font-[500] text-neutral-750 uppercase tracking-widest"></h3>
              </div>
              <div className="bg-white overflow-hidden">
                {[
                  { 
                    label: 'Phone Verification', 
                    icon: <Phone size={18}/>, 
                    desc: 'Verify your phone for account security',
                    status: profile?.phoneVerified ? 'verified' : 'pending'
                  },
                  { 
                    label: 'KYC Documents', 
                    icon: <ShieldCheck size={18}/>, 
                    desc: 'Upload identity for verification',
                    status: 'locked'
                  },
                  { 
                    label: 'Payout Methods', 
                    icon: <Wallet size={18}/>, 
                    desc: 'Manage how you receive payments',
                    status: profile?.paymentDetails ? 'configured' : 'pending'
                  },
                ].map((section) => (
                  <button key={section.label} onClick={() => {
                    setActiveSettingsSection(section.label);
                    setIsMobileDetailOpen(true);
                  }} className={`w-full p-4 md:p-6 text-left border-b border-slate-50 transition-all flex gap-4 hover:bg-slate-50 group ${activeSettingsSection === section.label ? 'bg-brand-50/30' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${activeSettingsSection === section.label ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-500'}`}>{section.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-[400] text-neutral-750">{section.label}</h4>
                        {section.status === 'verified' && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-[400] rounded-full uppercase tracking-wider">Verified</span>
                        )}
                        {section.status === 'configured' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-[400] rounded-full uppercase tracking-wider">Configured</span>
                        )}
                        {section.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-[400] rounded-full uppercase tracking-wider">Pending</span>
                        )}
                        {section.status === 'locked' && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-[400] rounded-full uppercase tracking-wider">Locked</span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 font-[300]">{section.desc}</p>
                    </div>
                    <ChevronRight size={16} className={`mt-1 transition-transform hidden md:block ${activeSettingsSection === section.label ? 'text-brand-500 translate-x-1' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto bg-slate-50/30 ${isMobileDetailOpen ? 'flex flex-col' : 'hidden md:flex flex-col'}`}>
              <AnimatePresence mode="wait">
                {activeSettingsSection === 'Phone Verification' && (
                  <motion.div key="phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 md:p-10 max-w-[600px] space-y-10">
                    <div className="space-y-4 flex gap-4">
                      <button 
                        onClick={() => setIsMobileDetailOpen(false)}
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all h-fit"
                      >
                        <ArrowLeft size={18} strokeWidth={1.5}/>
                      </button>
                      <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
                        <Smartphone size={16}/>
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-[400] text-neutral-750 tracking-tight">Phone Verification</h2>
                        <p className="text-[12px] text-neutral-500 font-[300]">To complete your host profile, we need to verify your phone number.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white px-2 rounded-[2rem]">
                      {profile?.phoneVerified ? (
                         <div className="space-y-6">
                            <div className="bg-brand-900 rounded-tr-lg rounded-bl-lg p-6 text-white overflow-hidden relative group">
                              <div className="relative z-10">
                                <div className='flex gap-3'>
                                  <ShieldCheck size={20} className="text-brand-500 mt-1" />
                                  <h3 className="text-md text-neutral-800 font-[400] mb-2">
                                    Phone Verified
                                  </h3>
                                </div>
                                <p className="text-slate-400 text-xs mb-6 font-[300] leading-relaxed">Your number {profile.phoneVerificationDetails?.phoneNumber || profile.user.phoneNumber} is verified.</p>
                                <button onClick={() => handlePhoneEdit()} className="w-full py-2 bg-brand-500 text-brand-50 font-[500] rounded-xl text-xs max-w-[100px] flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all">
                                  Edit <ArrowUpRight size={16} />
                                </button>
                              </div>
                              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
                            </div>
                         </div>
                      ) : (
                        <PhoneVerification 
                          phoneNumber={verifyPhone}
                          onPhoneUpdate={setVerifyPhone}
                          onVerificationComplete={handleVerificationComplete}
                        />
                      )}
                      
                      {isEditingPhone && profile?.phoneVerified && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                          <h3 className="text-sm font-[400] text-neutral-750 mb-4">Update Phone Number</h3>
                          <PhoneVerification 
                            phoneNumber={verifyPhone}
                            onPhoneUpdate={setVerifyPhone}
                            onVerificationComplete={() => {
                              handleVerificationComplete();
                              setIsEditingPhone(false);
                            }}
                          />
                          <button 
                            onClick={() => setIsEditingPhone(false)}
                            className="mt-4 text-xs text-neutral-500 hover:text-neutral-600"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeSettingsSection === 'KYC Documents' && (
                  <motion.div key="kyc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 md:p-10 max-w-[600px] space-y-10">
                    <div className="space-y-4 flex gap-4">
                      <button 
                        onClick={() => setIsMobileDetailOpen(false)}
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all h-fit"
                      >
                        <ArrowLeft size={18} strokeWidth={1.5}/>
                      </button>
                      <div className="w-10 h-10 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500 flex-shrink-0">
                        <ShieldCheck size={20}/>
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-[400] text-neutral-750 tracking-tight">KYC coming soon</h2>
                        <p className="text-[12px] text-neutral-500 font-[300]">Soon you'll be able to upload NID and Passport documents.</p>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-10 md:p-16 flex flex-col items-center justify-center text-center space-y-4 bg-white/50">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-neutral-500">
                        <Upload size={20}/>
                      </div>
                      <div>
                        <h4 className="text-md font-[400] text-neutral-500">Section Locked</h4>
                        <p className="text-[10px] text-neutral-500 font-[300]">Verify your phone first.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSettingsSection === 'Payout Methods' && (
                  <motion.div key="payout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 md:p-10 max-w-[600px] space-y-10">
                    <div className="space-y-4 flex gap-4">
                      <button 
                         onClick={() => setIsMobileDetailOpen(false)}
                         className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all h-fit"
                      >
                        <ArrowLeft size={18} strokeWidth={1.5}/>
                      </button>
                      <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
                        <Landmark size={20} strokeWidth={1.5}/>
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-[400] text-neutral-750 tracking-tight">Payout Management</h2>
                        <p className="text-[12px] text-neutral-500 font-[300]">Manage how you receive your earnings. Select one primary method.</p>
                      </div>
                    </div>

                    {!editingPayoutType ? (
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'bank_transfer', label: 'Bank Account', icon: <Landmark size={18}/> },
                          { id: 'bkash', label: 'bKash Wallet', icon: <Smartphone size={18}/> },
                          { id: 'nagad', label: 'Nagad Wallet', icon: <CreditCard size={18}/> },
                        ].map(method => (
                          <button 
                            key={method.id} 
                            onClick={() => setEditingPayoutType(method.id as any)}
                            className={`bg-white border-2 rounded-[2rem] p-4 flex items-center justify-between group transition-all border-slate-100 hover:translate-y-[-2px] hover:shadow-md`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${profile?.paymentDetails?.method === method.id ? 'bg-brand-500 text-white' : 'bg-slate-50 text-slate-400'}`}>{method.icon}</div>
                              <div className="text-left">
                                <span className="font-[300] text-sm text-slate-900 block">{method.label}</span>
                                {profile?.paymentDetails?.method === method.id ? (
                                  <span className="text-[9px] font-[300] text-brand-500 uppercase tracking-widest">Active & Configured</span>
                                ) : (
                                  <span className="text-[9px] font-[300] text-slate-400 uppercase tracking-widest">Available</span>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={18} className={`${profile?.paymentDetails?.method === method.id ? 'text-brand-500' : 'text-slate-200'}`} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-0 space-y-8">
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={() => setEditingPayoutType(null)} className="flex items-center gap-2 text-slate-400 hover:text-brand-600 hover:translate-x-[-2px] transition-all font-[300] text-xs uppercase tracking-widest">
                            <ArrowLeft size={16} strokeWidth={1.5}/>
                          </button>
                          <span className="text-[10px] font-[300] uppercase tracking-widest text-brand-500">Configure {editingPayoutType}</span>
                        </div>
                        
                        {editingPayoutType === 'bank_transfer' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2 flex flex-col gap-1">
                                <label className="text-xs font-[500] text-neutral-750 uppercase ml-1">Bank Name</label>
                                <input 
                                  value={paymentFormData.bankName}
                                  onChange={(e) => handleFormChange('bankName', e.target.value)}
                                  placeholder="e.g. City Bank" 
                                  className="w-full px-6 py-2 bg-slate-50 text-xs rounded-xl font-[400] outline-none border-2 border-transparent focus:border-brand-500/20"
                                />
                              </div>
                              <div className="space-y-2 flex flex-col gap-1">
                                <label className="text-xs font-[500] text-neutral-750 uppercase ml-1">Account Name</label>
                                <input 
                                  value={paymentFormData.accountHolderName}
                                  onChange={(e) => handleFormChange('accountHolderName', e.target.value)}
                                  placeholder="Full Name" 
                                  className="w-full px-6 py-2 bg-slate-50 text-xs rounded-xl font-[400] outline-none border-2 border-transparent focus:border-brand-500/20"
                                />
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2 flex flex-col gap-1">
                                <label className="text-xs font-[500] text-neutral-750 uppercase ml-1">Account Number</label>
                                <input 
                                  value={paymentFormData.accountNumber}
                                  onChange={(e) => handleFormChange('accountNumber', e.target.value)}
                                  placeholder="0000 0000 0000" 
                                  className="w-full px-6 py-2 bg-slate-50 text-xs rounded-xl font-[400] outline-none border-2 border-transparent focus:border-brand-500/20"
                                />
                              </div>
                              <div className="space-y-2 flex flex-col gap-1">
                                <label className="text-xs font-[500] text-neutral-750 uppercase ml-1">Branch Name</label>
                                <input 
                                  value={paymentFormData.branchName}
                                  onChange={(e) => handleFormChange('branchName', e.target.value)}
                                  placeholder="Dhaka Main Branch" 
                                  className="w-full px-6 py-2 bg-slate-50 text-xs rounded-xl font-[400] outline-none border-2 border-transparent focus:border-brand-500/20"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2 flex flex-col gap-1">
                                <label className="text-xs font-[500] text-neutral-750 uppercase ml-1">Routing Number</label>
                                <input 
                                  value={paymentFormData.routingNumber}
                                  onChange={(e) => handleFormChange('routingNumber', e.target.value)}
                                  placeholder="Routing Number" 
                                  className="w-full px-6 py-2 bg-slate-50 text-xs rounded-xl font-[400] outline-none border-2 border-transparent focus:border-brand-500/20"
                                />
                              </div>
                              <div className="space-y-2 flex flex-col gap-1">
                                <label className="text-xs font-[500] text-neutral-750 uppercase ml-1">Swift Code</label>
                                <input 
                                  value={paymentFormData.swiftCode}
                                  onChange={(e) => handleFormChange('swiftCode', e.target.value)}
                                  placeholder="Swift Code" 
                                  className="w-full px-6 py-2 bg-slate-50 text-xs rounded-xl font-[400] outline-none border-2 border-transparent focus:border-brand-500/20"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {(editingPayoutType === 'bkash' || editingPayoutType === 'nagad' || editingPayoutType === 'rocket') && (
                          <div className="space-y-6">
                            <div className="p-4 bg-brand-50 rounded-tr-xl rounded-bl-xl flex items-center gap-4 border border-brand-100 mb-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-500"><Smartphone size={20}/></div>
                              <p className="text-xs font-[300] text-brand-800">Ensure the wallet number is personal and verified.</p>
                            </div>
                            <div className="space-y-2 flex flex-col gap-1">
                              <label className="text-xs font-[500] text-neutral-750 uppercase ml-1">Wallet Number</label>
                              <div className="flex gap-4">
                                <div className="px-4 py-2 text-sm bg-slate-50 rounded-tr-lg rounded-bl-lg font-[400] text-slate-900 border-2 border-transparent">+880</div>
                                <input 
                                  value={paymentFormData.mobileNumber}
                                  onChange={(e) => handleFormChange('mobileNumber', e.target.value)}
                                  placeholder="171 234 5678" 
                                  className="flex-1 px-6 py-2 text-sm bg-slate-50 rounded-tr-lg rounded-bl-lg font-[400] outline-none border-2 border-transparent focus:border-brand-500/20"
                                />
                              </div>
                            </div>
                            <div className="space-y-2 flex flex-col gap-1">
                                <label className="text-xs font-[500] text-neutral-750 uppercase ml-1">Account Holder Name</label>
                                <input 
                                  value={paymentFormData.accountHolderName}
                                  onChange={(e) => handleFormChange('accountHolderName', e.target.value)}
                                  placeholder="Full Name" 
                                  className="w-full px-6 py-2 bg-slate-50 text-xs rounded-xl font-[400] outline-none border-2 border-transparent focus:border-brand-500/20"
                                />
                              </div>
                          </div>
                        )}

                        <button 
                          onClick={handleSavePayout}
                          disabled={isSaving}
                          className="w-full bg-brand-500 text-white py-2 rounded-tr-lg rounded-bl-lg font-[500] text-sm hover:bg-brand-600 transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save & Set as Primary'
                          )}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
      }
      </main>
    </div>
  );
};
