'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Shield, CreditCard, CheckCircle, XCircle, Clock,
  Upload, FileText, AlertCircle
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { PhoneVerification } from '@/components/host/settings/PhoneVerification';
import { useAuth } from '@/lib/context/auth';
import { apiClient } from '@/lib/api/client';

interface HostProfile {
  phoneNumber?: string;
  phoneVerified: boolean;
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  payoutMethods?: Array<{
    _id: string;
    type: 'bkash' | 'nagad' | 'bank';
    accountNumber: string;
    isDefault: boolean;
  }>;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  useEffect(() => {
    fetchHostProfile();
  }, []);

  const fetchHostProfile = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/api/host/profile') as HostProfile;
      setProfile(data);
      setPhoneNumber(data.phoneNumber || '');
    } catch (error) {
      console.error('Failed to fetch host profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    setShowPhoneVerification(false);
    fetchHostProfile(); // Refresh profile
  };

  const getStatusBadge = (status: string, verified?: boolean) => {
    if (verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
          <CheckCircle size={12} />
          Verified
        </span>
      );
    }

    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
            <Clock size={12} />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full">
            <AlertCircle size={12} />
            Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/30">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 pb-32">
        <div className="max-w-[1080px] mx-auto px-4 lg:px-8 pt-8 lg:pt-12">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 font-[300]">Manage your account settings and preferences</p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            
            {/* Phone Verification Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-[0_1px_4px_0px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <Phone className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Phone Verification</h3>
                      <p className="text-sm text-gray-500">Verify your phone number for account security</p>
                    </div>
                  </div>
                  {profile && getStatusBadge('', profile.phoneVerified)}
                </div>
              </div>

              <div className="p-6">
                {profile?.phoneVerified ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Phone Verified</p>
                        <p className="text-xs text-green-700">+880 {phoneNumber}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPhoneVerification(true)}
                      className="text-xs text-green-700 hover:text-green-800 font-medium"
                    >
                      Change Number
                    </button>
                  </div>
                ) : showPhoneVerification ? (
                  <PhoneVerification
                    phoneNumber={phoneNumber}
                    onVerificationComplete={handleVerificationComplete}
                    onPhoneUpdate={setPhoneNumber}
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-4">Your phone number is not verified</p>
                    <button
                      onClick={() => setShowPhoneVerification(true)}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                    >
                      Verify Phone Number
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* KYC Documents Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-[0_1px_4px_0px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 rounded-2xl">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">KYC Documents</h3>
                      <p className="text-sm text-gray-500">Upload identity documents for verification</p>
                    </div>
                  </div>
                  {profile && getStatusBadge(profile.kycStatus || 'not_submitted')}
                </div>
              </div>

              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm mb-4">KYC document upload coming soon</p>
                  <p className="text-xs text-gray-400">You'll be able to upload NID, Passport, and other documents</p>
                </div>
              </div>
            </motion.div>

            {/* Payout Methods Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-[0_1px_4px_0px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Payout Methods</h3>
                      <p className="text-sm text-gray-500">Manage how you receive payments</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm mb-4">Payout methods coming soon</p>
                  <p className="text-xs text-gray-400">You'll be able to add bKash, Nagad, and Bank accounts</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
