'use client';

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { publicService } from "@/lib/api/public";
import { orderService } from "@/lib/api/order";
import { adminService } from "@/lib/api/admin";
import { Search, X, ChevronDown, User, Wallet, Clock, Clock10, Music, ShieldCheck, Building, Building2, Minus, QrCode, ArrowDown, Rotate3D, CheckCircle2, Loader2, LogIn, UserPlus, ArrowLeft, Eye } from "lucide-react";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useAuth } from "@/lib/context/auth";
import { authService } from "@/lib/api/auth";
import { BDTIcon } from "@/components/ui/Icons";
import { TicketCard } from "../../ui/TicketCard";
import { useNotification } from '@/lib/context/notification';

import Sidebar from "../../layout/Sidebar";
import { formatDate, formatTime } from "@/lib/utils";

export default function AdminEventDetails() {
  const [event, setEvent] = useState<any>(null); // Ideally fetch full type, but 'any' or AdminEvent for now
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const eventId = params?.id as string;

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchEventDetails = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const data = await adminService.getEventById(eventId);
            setEvent(data);
        } catch (error) {
            console.error("Failed to fetch event details:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleDocumentClick = async (doc: any) => {
    if (!doc.objectKey) return;
    try {
        const { verificationDocumentLink } = await adminService.getVerificationDocumentLink(doc.objectKey);
        if (verificationDocumentLink) {
            window.open(verificationDocumentLink, '_blank');
        } else {
             // Fallback or error
             console.error("No link returned");
        }
    } catch (error) {
        console.error("Failed to get document link:", error);
    }
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
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Event Details</h1>
            <p className="text-sm text-slate-500 font-[300]">Comprehensive details about this event</p>
          </div>
           <div className="hidden lg:flex items-center gap-3">
              <button title='Help' onClick={() => {router.push('/host/help')}} className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            <p className="text-slate-500 ml-2">Loading event details...</p>
          </div>
        ) : !event ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">Event not found</p>
          </div>
        ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        <section className="space-y-6 2xl:col-span-2">
          <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-0 bg-slate-50 max-w-[600px] border border-slate-100 relative group overflow-hidden"
              >
                <div className="grid grid-cols-[1fr_minmax(14vw,14vw)] md:grid-cols-[1fr_minmax(7vw,7vw)] lg:grid-cols-[1fr_minmax(5vw,5vw)] xl:grid-cols-[1fr_minmax(6vw,6vw)] 2xl:grid-cols-[1fr_minmax(7vw,7vw)] gap-4">
                  {/* Main Image */}
                  <div className="relative aspect-[2/1] overflow-hidden rounded-tr-lg rounded-bl-lg">
                    <img
                      src={event?.coverImage || "https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60"}
                      alt={event?.title || "Event Cover Image"}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />

                    {event?.status === 'live' && (
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-light text-slate-900 border border-slate-100">
                        <span className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full" />
                        Live
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Vertical Gallery */}
                  {/* Vertical Gallery */}
                  <div className="flex flex-col gap-2 overflow-hidden">
                    {(event?.media?.gallery || []).slice(0, 4).map((img: any, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-[2/1] overflow-hidden rounded-tr-sm rounded-bl-sm"
                      >
                        <img
                          src={img?.url || `https://picsum.photos/id/${101 + idx}/200/120.jpg`}
                          alt={img?.caption || "Gallery image"}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 ml-[-12px] mb-2">
                    <div className="flex items-center gap-2 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-[300] text-slate-900 border border-slate-100">
                      <Music size={16} className="text-brand-500" strokeWidth={1}/>
                      {event?.category || 'Concert'}
                    </div>
                  </div>
                  <h2 className="text-lg font-[300] text-slate-700 tracking-tight">{event?.title || 'Event Name'}</h2>
                  <p className="text-sm text-neutral-500 font-[300] line-clamp-2">{event?.tagline || 'No tagline provided.'}</p>
                  
                  <div className="flex flex-col gap-2 mt-4 font-[300] text-slate-700">
                    <span className="flex items-center gap-2 text-sm ">
                      <Calendar className="text-neutral-600" size={14} strokeWidth={1}/>
                      {formatDate(event?.startDate) || 'TBD'}
                      {event?.endDate && new Date(event.startDate).getDate() !== new Date(event.endDate).getDate() ? ` - ${formatDate(event?.endDate)}` : ''}
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <Clock10 className="text-neutral-600" size={14} strokeWidth={1}/>
                       {formatTime(event?.startDate) || 'TBD'} - {formatTime(event?.endDate) || 'TBD'}
                    </span>
                  </div>
                  
                  <section className="p-2 max-w-[400px] bg-brand-card rounded-tr-lg rounded-bl-lg border border-brand-divider flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-2xl bg-white border border-brand-divider overflow-hidden flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-brand-400" strokeWidth={1}/>
                      </div>
                      <div>
                        <p className="text-[10px] font-[500] uppercase tracking-widest text-neutral-600 mb-1">Venue</p>
                        <div className="flex flex-col items-start">
                          <p className="text-xs text-neutral-500 font-[300]">{event?.venue?.name || 'Venue Name'}</p>
                          <p className="text-xs text-neutral-500 mt-[-4px] font-[300]">{event?.venue?.address?.city || 'City'}, {event?.venue?.address?.country || 'Country'}</p>
                        </div>
                      </div>
                    </div>
                    {event?.venue?.coordinates && (
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event?.venue?.coordinates?.coordinates?.[1]},${event?.venue?.coordinates?.coordinates?.[0]}`, '_blank')} className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
                      Directions
                    </button>
                    )}
                  </section>

                  <div className="flex flex-col gap-2 mt-6">
                    <p className="text-md font-[300] text-slate-700">
                      The Experience
                    </p>
                    <p className="text-sm font-[300] text-neutral-500 whitespace-pre-wrap">
                      {event?.description || 'No description provided.'}
                    </p>
                  </div>

                  <section className="p-2 max-w-[400px] bg-brand-card rounded-tr-lg rounded-bl-lg border border-brand-divider flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-[10px] font-[500] uppercase tracking-widest text-neutral-600 mb-1">Organizer</p>
                        <div className="flex flex-col items-start">
                          <p className="text-xs text-neutral-500 font-[300]">{event?.organizer?.companyName || 'Zenvy Studios'}</p>
                          <p className="text-xs text-brand-400 mt-[-4px] font-[300]">{event?.organizer?.companyEmail || 'support@zenvystudios.com'}</p>
                        </div>
                      </div>
                    </div>
                    {event?.hostId && (
                    <button onClick={() => window.open(`/profile/host/${event?.hostId}`, '_blank')} className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
                      Profile
                    </button>
                    )}
                  </section>

                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="absolute top-36 left-0 w-24 h-24 bg-brand-500/5 rounded-full -ml-8 -mt-8 transition-transform group-hover:scale-110" />
              </motion.div>
        </section>
        
        {/* Verification Documents section - Keeping this next to details */}
        <section className="space-y-6 md:col-span-2 lg:col-span-2 2xl:col-span-1 ">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Verification Documents</h2>
              <p className="text-xs text-slate-500 font-[300]">Please review carefully before approving</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {event.verification?.documents?.length > 0 ? (
                event.verification.documents.map((doc: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-brand-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md border border-slate-100 text-brand-500">
                                <FileText size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-[300] text-slate-700">{doc.filename || doc.type}</p>
                                <p className="text-xs text-slate-400 font-[300]">{formatDate(doc.uploadedAt)}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDocumentClick(doc)}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-white rounded-full transition-all"
                            title="View Document"
                        >
                            <Eye size={16} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" strokeWidth={1} />
                    <p className="text-sm text-slate-500">No verification documents uploaded</p>
                </div>
            )}
          </div>
        </section>

        {/* Stats & Tickets */}
        <section className="space-y-6 2xl:col-span-1">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                <h3 className="text-md font-medium text-slate-800 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-500">Status</span>
                         <span className={`px-2 py-0.5 rounded-full text-xs ${event.status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                             {event.status}
                         </span>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-500">Revenue</span>
                         <span className="text-sm font-medium"><BDTIcon className="inline w-3 h-3"/> {event.revenue}</span>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-500">Tickets Sold</span>
                         <span className="text-sm font-medium">{event.ticketsSold} / {event.totalTickets}</span>
                     </div>
                </div>
             </div>

             <div className="">
                <h3 className="text-md font-medium text-slate-800 mb-4">Event Tickets</h3>
                <div className="flex flex-col gap-4">
                    {(event?.tickets || []).map((ticket: any, i: number) => {
                         const sold = ticket.sold || 0;
                         const reserved = ticket.reserved || 0;
                         const totalQuantity = ticket.quantity || 0;
                         const availableQuantity = Math.max(0, totalQuantity - sold - reserved);

                         return (
                          (ticket.isVisible && ticket.isActive) && <TicketCard ticket={{
                            _id: ticket._id || i.toString(),
                            tier: ticket.tier || ticket.name,
                            name: event?.title || 'Event Name',
                            controls: true, // Hide numeric input
                            startDate: event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD',
                            endDate: event?.endDate ? new Date(event.endDate).toLocaleDateString() : 'TBD',
                            startTime: event?.startDate ? new Date(event.startDate).toLocaleTimeString() : 'TBD',
                            endTime: event?.endDate ? new Date(event.endDate).toLocaleTimeString() : 'TBD',
                            price: ticket.price?.amount || 0,
                            quantity: availableQuantity,
                            benefits: ticket.benefits || [],
                            venue: event?.venue?.name || '',
                            onClick: () => {},
                            selectedQuantity: 0,
                            onIncrement: () => {},
                            onDecrement: () => {},
                          }} key={i}/>
                         )
                    })}
                </div>
             </div>
        </section>

        </div>
        )}
      </main>
    </div>
  );
};
