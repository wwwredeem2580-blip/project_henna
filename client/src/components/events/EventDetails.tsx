'use client';

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { publicService } from "@/lib/api/public";
import { orderService } from "@/lib/api/order";
import { Logo } from "../shared/Logo";
import { Search, X, ChevronDown, User, Wallet, Clock, Clock10, Music, ShieldCheck, Building, Building2, Minus, QrCode, ArrowDown, Rotate3D, CheckCircle2, Loader2, LogIn, UserPlus, ArrowLeft } from "lucide-react";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutBKash } from './CheckoutBKash';
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
import { useNotification } from '@/lib/context/notification';

import Sidebar from "../layout/Sidebar";

export default function Events() {
  // Configuration
  const MAX_TICKETS_PER_ORDER = 5; // Easy to change - maximum total tickets per order
  
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'checkout' | 'success'>('selection');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const params = useParams();
  const eventId = params?.id as string;

  const onGoToWallet = () => {
    router.push('/wallet');
  };
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const ticketSectionRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        const eventData = await publicService.getEventDetails(eventId);
        setEvent(eventData);
        // Initialize ticket quantities to 0
        const initialQuantities: Record<string, number> = {};
        eventData?.tickets?.forEach((ticket: any) => {
          initialQuantities[ticket._id || ticket.name] = 0;
        });
        setTicketQuantities(initialQuantities);

        // Fetch recommendations based on current event
        try {
          const recommendations = await publicService.getRecommendedEvents({
            eventId: eventData._id,
            category: eventData.category,
            location: eventData.venue?.address?.city,
            limit: 5
          });
          setRecommendedEvents(recommendations);
        } catch (recError) {
          console.error('Failed to fetch recommendations:', recError);
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Check for payment success from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus === 'success') {
      setCheckoutStep('success');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Ticket quantity handlers with validation
  const getTotalTickets = () => {
    return Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handleIncrement = (ticketId: string, maxQuantity: number) => {
    setTicketQuantities(prev => {
      const current = prev[ticketId] || 0;
      const totalTickets = getTotalTickets();
      
      // Cannot exceed MAX_TICKETS_PER_ORDER total across all types
      if (totalTickets >= MAX_TICKETS_PER_ORDER) return prev;
      // Cannot exceed available quantity for this ticket
      if (current >= maxQuantity) return prev;
      
      return { ...prev, [ticketId]: current + 1 };
    });
  };

  const handleDecrement = (ticketId: string) => {
    setTicketQuantities(prev => {
      const current = prev[ticketId] || 0;
      // Cannot go below 0
      if (current <= 0) return prev;
      return { ...prev, [ticketId]: current - 1 };
    });
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!event?.tickets) return 0;
    return event.tickets.reduce((total: number, ticket: any) => {
      const quantity = ticketQuantities[ticket._id || ticket.name] || 0;
      const price = ticket.price?.amount || 0;
      return total + (quantity * price);
    }, 0);
  };

  const totalAmount = calculateTotal();
  const platformFee = Math.ceil(totalAmount * 0.05); // 5% platform fee
  const paymentProcessingFee = Math.ceil(totalAmount * 0.015); // 1.5% processing fee
  const grandTotal = totalAmount + platformFee + paymentProcessingFee;

  // Handle Book Now button click
  const handleBookNow = async () => {
    try {
      setCreatingOrder(true);
      setOrderError(null);

      // Validate ticket selection
      const totalTickets = getTotalTickets();
      if (totalTickets === 0) {
        setOrderError('Please select at least one ticket');
        setCreatingOrder(false);
        return;
      }

      if(!user){
        showNotification('error', 'Login', 'Please login to book tickets');
        router.push('/auth?tab=login');
        return;
      }

      // Prepare order payload
      const orderTickets = event.tickets
        .filter((ticket: any) => {
          const quantity = ticketQuantities[ticket._id || ticket.name] || 0;
          return quantity > 0;
        })
        .map((ticket: any) => ({
          ticketVariantId: ticket._id,
          variantName: ticket.tier || ticket.name,
          quantity: ticketQuantities[ticket._id || ticket.name],
          pricePerTicket: ticket.price?.amount || 0,
        }));

      // Determine payment method
      const paymentMethod = grandTotal === 0 ? 'free' : 'bkash';

      // Create order
      const orderResponse = await orderService.createOrder({
        eventId: event._id,
        tickets: orderTickets,
        paymentMethod,
      });

      // Handle response
      if (orderResponse.isFree) {
        // Free tickets - show success immediately
        setCheckoutStep('success');
      } else if (orderResponse.paymentUrl) {
        // Paid tickets - redirect to checkout
        router.push(orderResponse.paymentUrl);
      } else {
        throw new Error('Invalid order response');
      }
    } catch (error: any) {
      console.error('Order creation failed:', error);
      setOrderError(error.message || 'Failed to create order. Please try again.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const scrollToTickets = () => {
    if (ticketSectionRef.current) {
      ticketSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSignOut = async () => {
    await authService.logout()
    router.push('/auth?tab=login')
  }


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
            <p className="text-slate-500">Loading event details...</p>
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
                      src={event?.media?.coverImage?.url || "https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60"}
                      alt={event?.media?.coverImage?.alt || "Event Cover Image"}
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
                  <p className="text-sm text-neutral-500 font-[300] line-clamp-2">{event?.tagline || 'Lorem ipsum dolor sit amet consectetur adipisicing elit.'}</p>
                  <div className="flex flex-col gap-2 mt-4 font-[300] text-slate-700">
                    <span className="flex items-center gap-2 text-sm ">
                      <Calendar className="text-neutral-600" size={14} strokeWidth={1}/>
                      {event?.schedule?.startDate ? new Date(event.schedule.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '26th Jan 2026'}
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <Clock10 className="text-neutral-600" size={14} strokeWidth={1}/>
                      {event?.schedule?.startDate && event?.schedule?.endDate 
                        ? `${new Date(event.schedule.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${new Date(event.schedule.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                        : '9:00 AM - 5:00 PM'
                      }
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
                          <p className="text-xs text-neutral-500 font-[300]">{event?.venue?.name || 'Rose View Hotel'}</p>
                          <p className="text-xs text-neutral-500 mt-[-4px] font-[300]">{event?.venue?.address?.city || 'Dhaka'}, {event?.venue?.address?.country || 'Bangladesh'}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event?.venue?.coordinates?.coordinates[1]},${event?.venue?.coordinates?.coordinates[0]}`, '_blank')} className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
                      Get Directions
                    </button>
                  </section>
                  <div className="flex flex-col gap-2 mt-6">
                    <p className="text-md font-[300] text-slate-700">
                      The Experience
                    </p>
                    <p className="text-sm font-[300] text-neutral-500">
                      {event?.description || 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis quibusdam inventore quaerat alias commodi dignissimos laborum tenetur esse atque! Obcaecati magnam qui amet neque quia labore non, porro sunt. Dolores.'}
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
                    <button onClick={() => window.open(`/profile/host/${event?.hostId}`, '_blank')} className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
                      Profile
                    </button>
                  </section>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="absolute top-36 left-0 w-24 h-24 bg-brand-500/5 rounded-full -ml-8 -mt-8 transition-transform group-hover:scale-110" />
              </motion.div>
        </section>
        {/* Tickets */}
        <section ref={ticketSectionRef} className="space-y-6 2xl:col-span-1">
          <div className="">
            <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Event Tickets</h2>
            <p className="text-xs text-slate-500 font-[300]">What are you doing! Book yours right now.</p>
          </div>

          {/* Tickets Grid */}
          <div className="flex flex-col gap-6 mb-10">
            {event?.moderation?.sales?.paused && <div className="w-full max-w-[350px] p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 font-[400]">Event sales are paused. Please come back later</p>
            </div>}
            {(event?.tickets || []).map((ticket: any, i: number) => {
              // Calculate available quantity: total - sold - reserved
              const sold = ticket.sold || 0;
              const reserved = ticket.reserved || 0;
              const totalQuantity = ticket.quantity || 0;
              const availableQuantity = Math.max(0, totalQuantity - sold - reserved);
              
              return (
              (ticket.isVisible && ticket.isActive) && <TicketCard ticket={{
                _id: ticket._id || i.toString(),
                tier: ticket.tier || ticket.name,
                name: ticket?.name || 'Event Name',
                controls: true,
                startDate: event?.schedule?.startDate ? new Date(event.schedule.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '25 Jan, 2026',
                endDate: event?.schedule?.endDate ? new Date(event.schedule.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '26 Jan, 2026',
                startTime: event?.schedule?.startDate ? new Date(event.schedule.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '10:00 AM',
                endTime: event?.schedule?.endDate ? new Date(event.schedule.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '4:00 PM',
                price: ticket.price?.amount || 0,
                quantity: availableQuantity,
                benefits: ticket.benefits || [
                  'Access to event',
                  'Dedicated entrance',
                  'Premium experience',
                ],
                venue: `${event?.venue?.name || 'Venue'}, ${event?.venue?.address?.city || 'City'}`,
                onClick: () => {},
                selectedQuantity: ticketQuantities[ticket._id || ticket.name] || 0,
                onIncrement: () => handleIncrement(ticket._id || ticket.name, availableQuantity),
                onDecrement: () => handleDecrement(ticket._id || ticket.name),
              }} key={i}/>
              );
            })}
            <div className="flex flex-col gap-2 pt-4 w-full max-w-[350px] border-t-2 border-brand-400 items-end justify-end">
              <div className="flex items-center justify-between w-full gap-2">
                <p className="text-sm text-slate-600">Subtotal</p>
                <p className="text-sm text-slate-600"><BDTIcon className="text-sm"/>{totalAmount}</p>
              </div>
              <div className="flex items-center justify-between w-full gap-2">
                <p className="text-xs text-slate-500">Platform Fee (5%)</p>
                <p className="text-xs text-slate-500"><BDTIcon className="text-xs"/>{platformFee}</p>
              </div>
              <div className="flex items-center justify-between w-full gap-2">
                <p className="text-xs text-slate-500">Payment Processing Fee (1.5%)</p>
                <p className="text-xs text-slate-500"><BDTIcon className="text-xs"/>{paymentProcessingFee}</p>
              </div>
              <div className="flex items-center justify-between w-full gap-2 pt-2 border-t border-slate-200">
                <p className="text-base font-[400] text-slate-900">Total Amount</p>
                <p className="text-base font-[400] text-slate-900"><BDTIcon className="text-sm"/>{grandTotal}</p>
              </div>
              {orderError && (
                <div className="w-full max-w-[350px] p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-[400]">{orderError}</p>
                </div>
              )}
              <button 
                onClick={handleBookNow}
                disabled={creatingOrder || getTotalTickets() === 0}
                className="py-2 w-full bg-brand-500 rounded-sm text-[14px] font-[400] text-white hover:bg-brand-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  'Book Now'
                )}
              </button>
              <p className="text-xs text-slate-500 font-[300]">Includes: 5% Platform Fee</p>
              <div className="p-6 w-full bg-slate-50 rounded-[2rem] flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-500 shadow-sm">
                  <ShieldCheck size={20} strokeWidth={1}/>
                </div>
                <div>
                  <p className="text-[12px] font-[400] text-slate-700">7-Day Safety Net Refund</p>
                  <p className="text-[10px] text-neutral-500 font-[400]">Platform guaranteed authenticity</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 md:col-span-2 lg:col-span-2 2xl:col-span-1 2xl:items-end 2xl:place-items-end">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Suggested For You</h2>
              <p className="text-xs text-slate-500 font-[300]">Choose what's best for you</p>
            </div>
          </div>

          <div className="grid pb-4 2xl:pr-4 grid-flow-col auto-cols-[250px] gap-6 overflow-x-scroll scroll-smooth mb-10 2xl:grid-cols-1 2xl:grid-flow-row 2xl:max-h-[70vh]">
            {recommendedEvents.map((recEvent: any, i: number) => {
              const minPrice = recEvent.tickets?.length > 0 
                ? Math.min(...recEvent.tickets.map((t: any) => t.price?.amount || 0))
                : 0;
              const startDate = new Date(recEvent.schedule?.startDate);
              const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
              const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              
              return (
              <motion.div
                key={recEvent._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => router.push(`/events/${recEvent.slug || recEvent._id}`)}
                className="p-0 bg-slate-50 2xl:max-w-[250px] border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden cursor-pointer"
              >
                <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                  <img
                    src={recEvent.media?.coverImage?.url || 'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                    alt={recEvent.media?.coverImage?.alt || 'Event Cover Image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {recEvent.status === 'live' && (
                  <div className="absolute top-4 gap-2 left-4 flex items-center ">
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                      <div className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full mr-2"></div>
                      Live
                    </div>
                  </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 ml-[-12px] mb-2">
                  </div>
                  <h2 className="text-lg font-[300] text-slate-900 tracking-tight">{recEvent.title}</h2>
                  <p className="text-xs text-slate-500 font-[300] line-clamp-2">{recEvent.tagline || 'Join us for an amazing experience'}</p>
                  <div className="flex flex-col gap-2 mt-2 font-[400] text-neutral-700">
                    <span className="flex items-center gap-1 text-xs ">
                      <Calendar size={12} strokeWidth={1}/>
                      {formatDate(startDate)}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <Clock10 size={12} strokeWidth={1}/>
                      {formatTime(startDate)}
                    </span>
                  </div>
                  {/* Price */}
                  <div className="flex justify-between items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                      <span className="text-xs">From</span> <BDTIcon className="text-xs"/>{minPrice}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              </motion.div>
            )})}
          </div>
        </section>
        </div>
        )}

        {/* Scroll to Tickets Button - Hidden on md and larger screens */}
        <motion.button
          onClick={scrollToTickets}
          className="fixed bottom-6 right-6 md:hidden p-3 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-400 transition-all z-50"
          animate={{
            y: [0, -10, 0], // Reverse jumping animation (up then down)
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDown size={24} />
        </motion.button>
        
        
      </main>

      {/* Checkout Modal Mockup */}
      <AnimatePresence>
        {checkoutStep === 'checkout' && (
          <CheckoutBKash 
            amount={grandTotal}
            eventName={event?.title || 'Event'}
            tierName={`${Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0)} Ticket(s)`}
            onClose={() => setCheckoutStep('selection')}
            onSuccess={() => setCheckoutStep('success')}
          />
        )}

        {checkoutStep === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-[450px] bg-slate-50 rounded-tr-lg rounded-bl-lg shadow-4xl p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-[400] text-slate-950 tracking-tight">Awesome!</h3>
                <p className="text-slate-500 text-sm font-[300] leading-relaxed">Your ticket is now safe in your Engraved Wallet. Check your email for confirmation.</p>
              </div>
              <button 
                onClick={onGoToWallet}
                className="w-full bg-brand-500 text-white py-3 rounded-tr-lg rounded-bl-lg font-[500] text-md hover:bg-brand-600 transition-all"
              >
                Go to My Wallet
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
