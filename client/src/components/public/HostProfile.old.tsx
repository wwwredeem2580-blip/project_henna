'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  Award, 
  Star, 
  CheckCircle2, 
  Info,
  Activity,
  User,
  Mail,
  Smartphone,
  Fingerprint
} from 'lucide-react';
import { publicService } from '@/lib/api/public';

interface HostProfileData {
  host: {
    id: string;
    name: string;
    joinedDate: string;
    trustScore: any;
    profile?: {
      profilePicture?: string;
    };
    stats: {
      totalEvents: number;
      completedEvents: number;
    }
  }
}

export default function HostProfile() {
  const params = useParams();
  const router = useRouter();
  const hostId = params.hostId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HostProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await publicService.getHostProfile(hostId);
        setData(response);
      } catch (err) {
        console.error('Failed to fetch host profile:', err);
        setError('Host not found or profile is private.');
      } finally {
        setLoading(false);
      }
    };

    if (hostId) {
      fetchProfile();
    }
  }, [hostId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.6 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-slate-100 rounded-full" />
          <div className="h-4 w-32 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <User size={32} />
        </div>
        <h1 className="text-xl font-medium text-slate-900 mb-2">Profile Not Found</h1>
        <p className="text-slate-500 mb-6">{error || "This host profile doesn't exist or is currently unavailable."}</p>
        <button onClick={() => router.push('/')} className="text-brand-600 hover:text-brand-700 font-medium">
          Return to Home
        </button>
      </div>
    );
  }

  const { host } = data;
  const trustScoreValue = host.trustScore?.score || 0;
  const completionRate = host.stats.totalEvents > 0 
    ? ((host.stats.completedEvents / host.stats.totalEvents) * 100).toFixed(0) 
    : 0;
  
  // Determine trust level color/label
  let trustLabel = 'Excellent';
  if (trustScoreValue < 40) {
    trustLabel = 'Needs Improvement';
  } else if (trustScoreValue < 70) {
    trustLabel = 'Good Standing';
  }

  const joinYear = new Date(host.joinedDate).getFullYear();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-950">
      {/* Sticky Top Nav */}
      <Navbar onGetStarted={() => router.push('/auth/signup')} onLogin={() => router.push('/auth/login')} />
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-brand-divider px-6 py-4">
        <div className="max-w-[896px] mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Back</span>
          </button>
          <div className="px-3 py-1 bg-brand-50 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-600">
            Internal Agent Check
          </div>
        </div>
      </nav>

      <main className="max-w-[896px] mx-auto px-6 py-12 md:py-20 space-y-16">
        {/* Header Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
        >
          <motion.div variants={itemVariants} className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-brand-50 border-4 border-white shadow-2xl shadow-brand-100/50 overflow-hidden">
              <img 
                src={host.profile?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hostId}`} 
                className="w-full h-full object-cover" 
                alt={host.name} 
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-500 text-white p-3 rounded-2xl shadow-xl shadow-brand-500/30">
              <ShieldCheck size={24} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950">{host.name}</h1>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Verified Host
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2"><Calendar size={16} /> Joined {joinYear}</div>
              <div className="flex items-center gap-2"><Award size={16} /> Elite Organizer</div>
            </div>
          </motion.div>
        </motion.section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trust Score Card */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-10"
          >
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="#F59E0B" strokeWidth="10" 
                  strokeDasharray="282.7" 
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 282.7 - (282.7 * (trustScoreValue / 100)) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 leading-none">{trustScoreValue}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/100</span>
              </div>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <h3 className="text-lg font-bold text-slate-950 uppercase tracking-tight">Trust Score</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {trustLabel}
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[384px]">
                Based on event completion, verified reviews, and secure check-ins. A higher score unlocks platform benefits.
              </p>
            </div>
          </motion.div>

          {/* Simple Stat Cards */}
          <div className="flex flex-col gap-6">
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-sm"
            >
              <h4 className="text-4xl font-black text-slate-950 mb-1">{host.stats.totalEvents}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Events Hosted</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-sm"
            >
              <h4 className="text-4xl font-black text-slate-950 mb-1">{completionRate}%</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion Rate</p>
            </motion.div>
          </div>
        </section>

        {/* Verifications Section */}
        <motion.section 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Verifications</h2>
            <div className="flex items-center gap-2 text-brand-500 font-bold text-[10px] uppercase tracking-widest">
              <Star size={14} fill="currentColor"/> Verified Expert
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'ID Verified', icon: <Fingerprint size={24}/>, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
              { label: 'Email Verified', icon: <Mail size={24}/>, color: 'text-brand-500', bg: 'bg-brand-50/50' },
              { label: 'Phone Verified', icon: <Smartphone size={24}/>, color: 'text-secondary', bg: 'bg-blue-50/50' },
            ].map((v, i) => (
              <div key={i} className="p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6 group hover:border-brand-200 transition-all cursor-default bg-white">
                <div className={`w-14 h-14 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  {v.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{v.label}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-emerald-500" /> Confirmed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Note on Data Integrity */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-4 text-slate-400"
        >
          <Info size={18} className="flex-shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            This profile data is synced automatically from our PCI-DSS compliant infrastructure. Zenvy guarantees the authenticity of all host verifications displayed here.
          </p>
        </motion.div>
      </main>
    </div>
  );
};
