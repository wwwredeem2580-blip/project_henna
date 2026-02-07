'use client';

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import React from 'react';
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MoreHorizontal,
  CheckCircle2,
  Calendar,
  Briefcase,
  Mail,
  MapPin,
  Link as LinkIcon,
  ShieldCheck,
  User,
  HelpCircle,
  LogIn,
  UserPlus,
  Wallet,
} from 'lucide-react';

import { publicService } from "@/lib/api/public";
import { useAuth } from "@/lib/context/auth";
import Sidebar from "../layout/Sidebar";

interface HostProfileData {
  host: {
    id: string;
    name: string;
    joinedDate: string;
    trustScore: {
      score: number;
    };
    profile?: {
      firstName: string;
      lastName: string;
      email: string;
      businessName: string;
      businessEmail: string;
      website?: string;
      photo?: string;
    };
    stats: {
      totalEvents: number;
      completedEvents: number;
    }
  }
}

const TrustScoreWheel = ({ score }: { score: number }) => {
  // Calculate hue from 0 (Red) to 120 (Green) based on score
  const hue = Math.min(Math.max(score, 0), 100) * 1.2;
  const strokeColor = `hsl(${hue}, 80%, 45%)`; // Slightly darker than 50% for better contrast on white
  return (
    <div className="flex items-center gap-4 mt-4 py-4 rounded-2xl bg-zinc-50/50 w-fit">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E4E4E7" strokeWidth="10" />
          <motion.circle 
            cx="50" cy="50" r="45" fill="none" stroke={strokeColor} strokeWidth="10" 
            strokeDasharray="282.7" 
            initial={{ strokeDashoffset: 282.7 }}
            animate={{ strokeDashoffset: 282.7 - (282.7 * (Math.min(score, 100) / 100)) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] font-[500] text-neutral-800">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-[500] text-neutral-800 uppercase tracking-wide">Trust Score</p>
        <p className="text-[10px] text-neutral-600 font-[300] leading-tight max-w-[140px]">
          Based on identity, hosting history & reviews.
        </p>
      </div>
    </div>
  );
};

export default function HostProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HostProfileData | null>(null);

  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const hostId = params.hostId as string;

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

  const profile = data?.host?.profile;
  const trustScoreValue = data?.host?.trustScore?.score || 0;
  
  // Derived / Fallback Data
  const bio = "Professional Event Organizer on Zenvy. Dedicated to creating memorable experiences and building safe, inclusive communities.";
  const location = "Bangladesh";
  const isVerified = trustScoreValue > 80;

  const stats = {
    followers: 120, // Mock
    following: 45 // Mock
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 lg:p-8 ">
        <button onClick={() => router.back()} className="text-sm mb-6 font-[300] text-neutral-400 hover:text-brand-500 transition-colors flex items-center gap-1 group">
          <ArrowLeft size={16} strokeWidth={1} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Host Profile</h1>
            <p className="text-sm text-slate-500 font-[300]">Comprehensive details about this host</p>
          </div>
          {user ? (
            <div className="hidden lg:flex items-center gap-3">
                <button onClick={() => user?.role === 'host' ? router.push('/host/wallet') : router.push('/wallet')} title="Wallet" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Wallet size={18}/></button>
                {user?.role === 'host' && (
                  <button onClick={() => router.push('/host/events')} title="My Events" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Calendar size={18}/></button>
                )}
                <button onClick={() => router.push('/contact')} title="Help" className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
                <div title={user?.email} className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
                  <img onClick={() => {user?.role === 'host' ? router.push('/host/profile') : router.push('/wallet')}} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover cursor-pointer" />
                </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => router.push('/auth?tab=login')} title="Login" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><LogIn size={18}/></button>
              <button onClick={() => router.push('/onboarding')} title="Register" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><UserPlus size={18}/></button>
            </div>
          )}
        </header>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">Loading Profile...</p>
          </div>
        ) : !data?.host ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">Profile not found</p>
          </div>
        ) : (

        <div className="grid gap-6 max-w-[500px] mx-auto">
          {/* Banner */}
          <div className="relative aspect-[3/1] bg-zinc-200 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${data?.host?.id}&backgroundColor=f4f4f5`} className="w-full h-full object-cover opacity-50" alt="Banner" />
          </div>

          {/* Profile Info Section */}
          <div className="px-4 relative mb-4">
            {/* Avatar Overlay */}
            <div className="absolute -top-[45px] sm:-top-[70px] left-4 w-[90px] h-[90px] sm:w-[141px] sm:h-[141px] rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data?.host?.profile?.email}`} className="w-full h-full object-cover" alt="Avatar" />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end py-3 gap-2">
               <button className="p-1 border border-zinc-200 rounded-full hover:bg-zinc-100 transition-colors text-black">
                 <MoreHorizontal size={16} strokeWidth={1} />
               </button>
               {user && user.email === data?.host?.profile?.email ? (
                  <button className="bg-black text-white font-[500] px-4 py-1 rounded-full hover:bg-zinc-800 transition-colors text-sm">
                    Edit Profile
                  </button>
               ) : (
                  <button className="bg-brand-500 text-white font-[500] px-4 py-1 rounded-full hover:translate-y-[-2px] transition-all text-sm">
                    Follow
                  </button>
               )}
            </div>

            {/* Bio Details */}
            <div className="mt-4">
              <h2 className="text-xl font-[500] flex items-center gap-1 text-black">
                {data?.host?.profile?.businessName || data?.host?.name}
                {isVerified && <CheckCircle2 size={20} className="text-blue-500 fill-blue-500 text-white" />}
              </h2>
              <p className="text-zinc-500 text-sm font-[300]">@{(data?.host?.profile?.businessName || data?.host?.name).replace(/\s+/g, '').toLowerCase()}</p>
              
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">{bio}</p>

              <TrustScoreWheel score={trustScoreValue} />
              <div className="mt-5 flex gap-10 text-[14px] border-b border-zinc-100 pb-5">
                <div className="flex flex-col">
                   <span className="font-[500] text-black text-xl">{data?.host?.stats?.totalEvents}</span>
                   <span className="text-zinc-500 text-[10px] uppercase font-[500] tracking-widest">Events Organized</span>
                </div>
                <div className="flex flex-col">
                   <span className="font-[500] text-black text-xl">{data?.host?.stats?.completedEvents}</span>
                   <span className="text-zinc-500 text-[10px] uppercase font-[500] tracking-widest">Completed</span>
                </div>
              </div>
              <div className="mt-5 items-start grid grid-cols-1 gap-12 border-t border-zinc-100 pt-5">
                {data?.host?.profile?.businessEmail && (
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-brand-600" />
                        <p className="text-sm text-brand-600 hover:underline cursor-pointer font-medium truncate max-w-[200px]">{data?.host?.profile?.businessEmail}</p>
                    </div>
                )}
                <div>
                  <p className="text-[10px] font-[500] text-zinc-400 uppercase tracking-widest mb-2.5">Representative</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <User size={16} strokeWidth={1} className="text-neutral-600" />
                        <p className="text-sm font-[400] text-neutral-600">{data?.host?.profile?.firstName} {data?.host?.profile?.lastName}</p>
                    </div>
                    {data?.host?.profile?.email && (
                        <div className="flex items-center gap-2">
                            <Mail size={16} strokeWidth={1} className="text-neutral-600" />
                            <p className="text-sm text-neutral-600 font-[400] truncate max-w-[200px]">{data?.host?.profile?.email}</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-neutral-600 text-[14px]">
                <div className="flex items-center gap-1.5 font-[300]">
                   <MapPin size={16} strokeWidth={1}/>
                   {location}
                </div>
                {data?.host?.profile?.website && (
                    <div className="flex items-center gap-1.5 font-[300]">
                       <LinkIcon size={16} strokeWidth={1}/>
                       <a href={data?.host?.profile?.website.startsWith('http') ? data?.host?.profile?.website : `https://${data?.host?.profile?.website}`} target="_blank" rel="noopener noreferrer" className="text-[#1d9bf0] hover:underline">
                         {data?.host?.profile?.website.replace(/^https?:\/\//, '')}
                       </a>
                    </div>
                )}
                <div className="flex items-center gap-1.5 font-[300]">
                   <Calendar size={16} strokeWidth={1}/>
                   Joined {new Date(data?.host?.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* <div className="mt-4 flex gap-5 text-[14px]">
                <div className="hover:underline cursor-pointer flex gap-1 items-baseline">
                   <span className="font-bold text-black">{stats.following}</span>
                   <span className="text-zinc-500">Following</span>
                </div>
                <div className="hover:underline cursor-pointer flex gap-1 items-baseline">
                   <span className="font-bold text-black">{stats.followers}</span>
                   <span className="text-zinc-500">Followers</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>)}
      </main>
    </div>
  );
}

{/* Main Content Area - Justify Start to put column on left (after sidebar) */}
      // <main className="flex-1 flex justify-center lg:ml-64"> 
        {/* Main Feed Column - Pixel Based Width */}
        {/* <div className="w-full max-w-[600px] min-h-screen border-r border-zinc-100 bg-white relative pb-20">
           */}
          {/* Sticky Top Header */}
          {/* <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-1 flex items-center gap-6 border-b border-zinc-50">
            <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-black">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-1 leading-tight text-black">
                {name}
                {isVerified && <CheckCircle2 size={18} className="text-blue-500 fill-blue-500 text-white" />}
              </h1>
              <p className="text-zinc-500 text-sm font-medium">{host.stats.totalEvents} events</p>
            </div>
          </header>

          
        </div>
      </main> */}