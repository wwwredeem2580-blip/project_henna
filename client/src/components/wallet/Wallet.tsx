'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { publicService } from "@/lib/api/public";
import { ticketService, Ticket } from "@/lib/api/ticket";
import { Logo } from "../shared/Logo";
import { Search, X, ChevronDown, User, Wallet, Clock, Clock10, QrCode, Rotate3D, Minus, ArrowDown, DownloadIcon, FileText } from "lucide-react";


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Star,
  Trash2,
  UserCircle,
  HelpCircle,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  Menu,
} from 'lucide-react';
import { useAuth } from "@/lib/context/auth";
import { authService } from "@/lib/api/auth";
import { BDTIcon, LightningIcon, LocationIcon } from "../ui/Icons";

import { TicketCard } from "../ui/TicketCard";

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  let menuItems = [
    { icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Explore' },
    { icon: <Calendar size={18} strokeWidth={1} />, label: 'My Events' },
    { icon: <ShoppingBag size={18} strokeWidth={1} />, label: 'Wallet', active: true },
    { icon: <User size={18} strokeWidth={1} />, label: 'Profile' },
    { icon: <Settings size={18} strokeWidth={1} />, label: 'Settings' },
  ];

  // Fetch user tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const userTickets = await ticketService.getUserTickets();
        setTickets(userTickets);
      } catch (err: any) {
        console.error('Failed to fetch tickets:', err);
        setError(err.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Group tickets by event
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const eventId = ticket.eventId;
    if (!acc[eventId]) {
      acc[eventId] = {
        eventId,
        eventTitle: ticket.eventTitle,
        eventDate: ticket.eventDate,
        eventVenue: ticket.eventVenue,
        venueAddress: ticket.venueAddress,
        tickets: [],
      };
    }
    acc[eventId].tickets.push(ticket);
    return acc;
  }, {} as Record<string, { eventId: string; eventTitle: string; eventDate: string; eventVenue: string; venueAddress: string; tickets: Ticket[] }>);

  const eventGroups = Object.values(groupedTickets);

  const handleSignOut = async () => {
    await authService.logout()
    router.push('/auth?tab=login')
  }


  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-950">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 overflow-y-auto border-r border-slate-100 flex flex-col fixed h-full bg-white z-40 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex items-center gap-3">
          <Logo variant='full' />
        </div>

        <nav className="flex-1 px-4 py-4">
          <div className="text-[10px] font-[500] text-slate-400 uppercase tracking-widest mb-4 px-4">Menu</div>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-[400] transition-all ${
                  item.active ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="text-[10px] font-[500] text-slate-400 uppercase tracking-widest mb-2 px-4">Options</div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-[500] text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 lg:p-8 ">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Logo variant='full' />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <img src="https://picsum.photos/seed/user1/100/100" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Wallet</h1>
            <p className="text-sm text-slate-500 font-[300]">All your secure entries and digital invitations in one industry-grade vault.</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <button className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Wallet size={18}/></button>
            <button className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Calendar size={18}/></button>
            <button className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src="https://picsum.photos/seed/user1/100/100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
        {/* Tickets */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
              {/* <div>
                <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Tickets</h2>
                <p className="text-xs text-slate-500 font-[300]">All your tickets are at one place</p>
              </div> */}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-600 font-[300]">Loading your tickets...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <p className="text-red-600 font-[400]">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-sm text-brand-500 hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : eventGroups.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <p className="text-slate-600 font-[400]">No tickets found</p>
                  <button 
                    onClick={() => router.push('/events')}
                    className="text-sm text-brand-500 hover:underline"
                  >
                    Browse Events
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {eventGroups.map((eventGroup) => {
                  const eventDate = new Date(eventGroup.eventDate);
                  const formattedDate = eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={eventGroup.eventId}>
                      <div
                        onClick={() => setExpandedId(expandedId === eventGroup.eventId ? null : eventGroup.eventId)}
                        className='max-w-[90vw] group cursor-pointer transition-all duration-300 p-4 flex items-center gap-0 overflow-hidden relative select-none'
                      >
                        <div className='rounded-tr-lg rounded-bl-lg overflow-hidden shrink-0 relative bg-slate-100 w-24 h-24'>
                          <img src='https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60' alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div className="px-6 py-4 w-full h-full flex flex-col gap-1 relative">
                          <div className="text-md font-[400] line-clamp-2 tracking-wide text-neutral-700">
                            {eventGroup.eventTitle}
                          </div>
                          <div className="text-neutral-400 line-clamp-2 font-[500] text-[10px] uppercase tracking-widest">
                            {eventGroup.eventVenue}, {eventGroup.venueAddress}
                          </div>
                          <div className="mt-2">
                            <div className="text-neutral-400 font-[500] line-clamp-2 text-[10px] uppercase tracking-widest">
                              {formattedDate}
                            </div>
                            <div className="text-neutral-400 font-[500] line-clamp-2 text-[10px] uppercase tracking-widest">
                              {formattedTime}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 line-clamp-1 font-[300]">
                            {daysUntilEvent > 0 ? `${daysUntilEvent} Days Left` : daysUntilEvent === 0 ? 'Today' : 'Event Passed'}
                          </span>
                          <div className="mt-2">
                            <button 
                              onClick={(e) => e.stopPropagation()}
                              className="border text-[10px] sm:text-xs font-[300] hover:scale-103 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                            >
                              <DownloadIcon size={12} />
                              Download All ({eventGroup.tickets.length})
                            </button>
                          </div>

                          <div className="absolute bottom-18 right-2 transition-transform pointer-events-none">
                            <ChevronDown size={24} className={`group-hover:scale-120 transition-transform duration-300 ${expandedId === eventGroup.eventId ? 'rotate-180' : ''}`} strokeWidth={1}/>
                          </div>
                        </div>
                      </div>
                      {/*Tickets*/}
                      <AnimatePresence>
                        {expandedId === eventGroup.eventId && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 max-w-full pb-6 overflow-x-auto">
                              <div className="flex gap-4">
                                {eventGroup.tickets.map((ticket) => {
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
                                          onClick={() => window.open(ticket.qrCodeUrl, '_blank')}
                                          className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                                        >
                                          <DownloadIcon size={12} />
                                          QR Image
                                        </button>
                                        <button className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm">
                                          <FileText size={12} />
                                          PDF
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
      </main>
    </div>
  );
};
