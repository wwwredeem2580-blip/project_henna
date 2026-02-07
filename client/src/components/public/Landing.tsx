'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Calendar, LogOut, Sparkles, CheckCircle2,
  Wallet, ShieldCheck, Zap, Activity, MessageCircle, ArrowRight,
  Globe, Fingerprint, Lock, Layers, BarChart3, Ticket,
  ShieldAlert, RefreshCcw, Bell, Star, X, Send, Palette, FileText,
  CreditCard, Clock10, Music, Mic, Disc, Headphones, Speaker, PartyPopper,
  Users, Image, Rocket, Clapperboard, Trophy, Briefcase, Heart
} from 'lucide-react';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { Logo } from '../shared/Logo';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';
import { publicService } from '@/lib/api/public';
import { BDTIcon } from '../ui/Icons';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onExploreEvents: () => void;
}



const promoScenes = [
  {
    id: 1,
    title: "Reinventing the Standard",
    subtitle: "Beyond self-hosting. Beyond gatekept platforms. A verified open marketplace.",
    icon: <ShieldCheck size={40} />,
    color: "bg-brand-600",
    tag: "THE NARRATIVE"
  },
  {
    id: 2,
    title: "7-Day Refund Policy",
    subtitle: "Built-in consumer protection. We bridge the trust gap in event commerce.",
    icon: <RefreshCcw size={40} />,
    color: "bg-neutral-900",
    tag: "FOR ATTENDEES"
  },
  {
    id: 3,
    title: "Power Under Constraint",
    subtitle: "Hosts manage with precision. Users buy with absolute certainty.",
    icon: <Lock size={40} />,
    color: "bg-blue-500",
    tag: "HYBRID LOGIC"
  },
  {
    id: 4,
    title: "Automated bKash Payouts",
    subtitle: "Nightly cron-workers handle the math. You focus on the experience.",
    icon: <CreditCard size={40} />,
    color: "bg-brand-700",
    tag: "FOR ORGANIZERS"
  }
];

const BrandPromotionVideo: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % promoScenes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = promoScenes[index];

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-video md:aspect-[21/9] bg-neutral-0 rounded-3xl md:rounded-[3rem] overflow-hidden border border-brand-200 shadow-3xl flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,61,230,0.03),transparent)]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col md:grid md:grid-cols-12 w-full h-full p-6 md:p-12 items-center gap-6 md:gap-0"
        >
          <div className="md:col-span-7 space-y-4 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex font-[300] items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
            >
              <Zap size={10} /> {current.tag}
            </motion.div>

            <h2 className="text-md md:text-3xl font-[300] text-neutral-900 leading-[1.1] tracking-tight">
              {current.title}
            </h2>

            <p className="text-[10px] font-[300] md:text-base text-neutral-500 mx-auto md:mx-0 leading-relaxed">
              {current.subtitle}
            </p>

            <motion.button
              whileHover={{ x: 5 }}
              className="hidden md:flex items-center gap-2 text-brand-600 font-[300] text-xs mx-auto md:mx-0 uppercase tracking-widest"
            >
              Learn the Mechanics <ArrowRight size={14} />
            </motion.button>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <motion.div
              initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              className={`w-20 h-20 md:w-32 md:h-32 lg:w-44 lg:h-44 rounded-[2rem] lg:rounded-[3rem] ${current.color} flex items-center justify-center text-white shadow-2xl shadow-brand-100/50 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-neutral-0/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="scale-100">
                {current.icon}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 flex gap-2">
        {promoScenes.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-700 ${i === index ? 'w-10 bg-brand-600' : 'w-3 bg-neutral-100'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin, onExploreEvents }) => {

  const { user } = useAuth();
  const router = useRouter();
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const events = await publicService.getFeaturedEvents(8);
        setFeaturedEvents(events);
      } catch (error) {
        console.error('Failed to fetch featured events', error);
      }
    };
    fetchFeatured();
  }, []);
  
  return (
    <div className="min-h-screen bg-neutral-0 selection:bg-brand-100 selection:text-brand-700">
      {/* Navigation */}
      <Navbar onLogin={onLogin} onGetStarted={onGetStarted} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden px-6">
        {/* Background Cover Image */}
        <div className="absolute inset-0 z-0 select-none">
            <img 
              src="/cover/cover.png" 
              alt="Background" 
              className="w-full h-full object-cover opacity-90"
            />
            {/* Gradient Overlay for Text Readability and Blending */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-neutral-0" />
        </div>

        {/* Decorative Floating Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <motion.div 
               initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
               animate={{ opacity: 1, scale: 1, rotate: -10, y: [0, -20, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
               className="absolute top-20 left-[10%] text-brand-500/20"
             >
               <Music size={64} strokeWidth={1} />
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
               animate={{ opacity: 1, scale: 1, rotate: 25, y: [0, 20, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute top-32 right-[15%] text-brand-600/20"
             >
               <Ticket size={80} strokeWidth={1} />
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
               animate={{ opacity: 1, scale: 1, rotate: -5, y: [0, -15, 0] }}
               transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
               className="absolute bottom-32 left-[15%] text-purple-500/20"
             >
               <Mic size={56} strokeWidth={1} />
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.5, rotate: 30 }}
               animate={{ opacity: 1, scale: 1, rotate: 40, y: [0, 25, 0] }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
               className="absolute bottom-20 right-[10%] text-pink-500/20 "
             >
               <Disc size={72} strokeWidth={1} />
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
               transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
               className="absolute top-1/3 left-[5%] text-orange-500/10 hidden md:block"
             >
               <PartyPopper size={48} strokeWidth={1} />
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
               animate={{ opacity: 1, scale: 1, rotate: -45, y: [0, 15, 0] }}
               transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
               className="absolute top-1/4 right-[5%] text-blue-500/10 hidden md:block"
             >
               <Headphones size={52} strokeWidth={1} />
             </motion.div>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(103,61,230,0.06)_0%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative space-y-8">
          {/* <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-600 text-[10px] font-bold uppercase tracking-widest"
          >
            <Sparkles size={12} className="animate-pulse" />
            Human-led, AI-powered
          </motion.div> */}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[42px] md:text-[56px] font-[300] text-neutral-950 tracking-tighter leading-[1.1]"
          >
            Bangladesh's <br />
            <span className="text-brand-500 italic">Trusted Event Ticketing Platform</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ lineHeight: '32px' }}
            className="text-[18px] font-light text-neutral-600 w-full mx-auto"
          >
            Verified organizers, secure ticketing, and intelligent event management powered by Zenvy.
          </motion.p>

          {user ? (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
          >
            <Button 
              onClick={onExploreEvents}
              variant="brand" 
              size="lg" 
              className="text-base h-14 px-8 rounded-xl shadow-xl shadow-brand-200/50 hover:-translate-y-1 active:translate-y-0"
            >
              Explore Events
            </Button>
            {user.role === 'host' && (
              <Button 
                onClick={() => router.push('/host/events/create')}
                variant="brand-outline" 
                size="lg" 
                className="text-base h-14 px-8 rounded-xl"
              >
                Create Event
              </Button>
            )}
          </motion.div>
          ) : (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
          >
            <Button 
              onClick={onGetStarted}
              variant="brand-outline" 
              size="lg" 
              className="text-base h-14 px-8 rounded-xl"
            >
              Get started
            </Button>
            <Button 
              onClick={onExploreEvents}
              variant="brand" 
              size="lg" 
              className="text-base h-14 px-8 rounded-xl shadow-xl shadow-brand-200/50 hover:-translate-y-1 active:translate-y-0"
            >
              Explore Events
            </Button>
          </motion.div>
          )}
        </div>
      </section>

      {/* Category Infinite Scroll Section */}
      <section className="py-10 border-b border-neutral-100 bg-neutral-0 overflow-hidden">
        <div className="max-w-[100vw] mx-auto">
           <div className="relative flex overflow-hidden">
             {/* Gradient Masks for smooth fade out at edges */}
             <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
             <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

             <motion.div 
               className="flex gap-16 items-center whitespace-nowrap px-8"
               animate={{ x: ["0%", "-50%"] }}
               transition={{ 
                 repeat: Infinity, 
                 ease: "linear", 
                 duration: 30 
               }}
             >
               {[...Array(2)].map((_, i) => (
                 <React.Fragment key={i}>
                    {[
                      { icon: <Users size={24} strokeWidth={1.5} />, label: "Seminars" },
                      { icon: <Briefcase size={24} strokeWidth={1.5} />, label: "Business" },
                      { icon: <Image size={24} strokeWidth={1.5} />, label: "Exhibitions" },
                      { icon: <Rocket size={24} strokeWidth={1.5} />, label: "Launching" },
                      { icon: <Mic size={24} strokeWidth={1.5} />, label: "Stand-up" },
                      { icon: <PartyPopper size={24} strokeWidth={1.5} />, label: "Party" },
                      { icon: <Heart size={24} strokeWidth={1.5} />, label: "Pop Culture" },
                      { icon: <Clapperboard size={24} strokeWidth={1.5} />, label: "Movie / Drama" },
                      { icon: <Music size={24} strokeWidth={1.5} />, label: "Concert" },
                      { icon: <Trophy size={24} strokeWidth={1.5} />, label: "Sports" },
                      { icon: <Palette size={24} strokeWidth={1.5} />, label: "Arts" },
                      { icon: <Globe size={24} strokeWidth={1.5} />, label: "Festivals" },
                    ].map((cat, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-3 text-neutral-400 hover:text-brand-600 transition-colors cursor-pointer group">
                         <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 group-hover:border-brand-200 group-hover:bg-brand-50 transition-all">
                            {cat.icon}
                         </div>
                         <span className="text-sm font-light tracking-wide">{cat.label}</span>
                      </div>
                    ))}
                 </React.Fragment>
               ))}
             </motion.div>
           </div>
        </div>
      </section>

      {/* Brand Showcase Section */}
      {/* <section className="py-16 px-6">
        <BrandPromotionVideo />
      </section> */}

      {/* Trending Events Showcase */}
      {featuredEvents.length > 0 && (
        <section className="py-24 px-6 bg-neutral-0 border-t border-neutral-100">
          <div className="max-w-[1080px] mx-auto space-y-12">
             <div className="flex items-end justify-between">
                <div className="space-y-4 max-w-[700px]">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-600 text-[10px] font-bold uppercase tracking-widest"
                    >
                        <Zap size={12} />
                        Live Now
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-light text-neutral-950 tracking-tight">
                      Featured on Zenvy
                    </h2>
                    <p className="text-neutral-500 font-light text-lg">Curated experiences happening across the country.</p>
                </div>
                <Button onClick={onExploreEvents} variant="outline" className="hidden md:flex rounded-xl border-neutral-200 text-neutral-600 hover:text-brand-600 hover:border-brand-200">
                    View All Events
                </Button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredEvents.map((event, i) => {
                    const minPrice = event.tickets?.length > 0 
                      ? Math.min(...event.tickets.map((t: any) => t.price?.amount))
                      : 0;
                    const startDate = new Date(event.schedule?.startDate);
                    const endDate = new Date(event.schedule?.endDate);
                    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                    return (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => router.push(`/events/${event.slug || event._id}`)}
                            className="p-0 bg-slate-50 border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden cursor-pointer"
                        >
                            <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                                <img
                                  src={event.media?.coverImage?.url || 'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {event.status === 'live' && (
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
                                  <div className="flex items-center gap-1 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                                    <Logo className="w-4 text-brand-500" /> Featured
                                  </div>
                                </div>
                                <h2 className="text-lg font-[300] text-slate-900 tracking-tight truncate">{event.title}</h2>
                                <p className="text-xs text-slate-500 font-[300] line-clamp-2">{event.tagline || event.description}</p>
                                <div className="flex flex-col gap-2 mt-2 font-[400] text-neutral-700">
                                    <span className="flex items-center gap-1 text-xs ">
                                        <Calendar size={12} strokeWidth={1} />
                                        {formatDate(startDate)}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs">
                                        <Clock10 size={12} strokeWidth={1} />
                                        {formatTime(startDate)} - {formatTime(endDate)}
                                    </span>
                                </div>
                                {/* Price */}
                                <div className="flex justify-between items-center gap-2 mt-2">
                                    <span className="text-xs text-slate-500 font-[300]">
                                        {event.venue?.address?.city || 'Location TBA'}
                                    </span>
                                    <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                                        <span className="text-xs">From</span> <BDTIcon className="text-xs" />{minPrice}
                                    </span>
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        </motion.div>
                    );
                })}
             </div>
             
             <div className="md:hidden flex justify-center pt-8">
                <Button onClick={onExploreEvents} variant="outline" className="rounded-xl border-neutral-200 text-neutral-600 w-full">
                    View All Events
                </Button>
             </div>
          </div>
        </section>
      )}

      {/* Feature Walkthrough - 'Idea to Hosted' Style Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] bg-brand-600 rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
              {/* Mock Dashboard UI */}
              <div className="absolute top-8 left-8 right-8 bottom-[-20%] bg-neutral-0 rounded-t-3xl shadow-2xl overflow-hidden p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-brand-600"><Logo className="w-4 h-4" strokeWidth="3"/></div>
                    <span className="text-xs font-light text-neutral-900">Event Builder</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-12 bg-neutral-100 rounded-full" />
                    <button className="px-3 py-1 bg-brand-600 text-[10px] text-white font-bold rounded">Publish</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 w-2/3 bg-neutral-50 rounded-lg" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 flex items-center justify-center"><Palette size={16} className="text-neutral-300"/></div>
                    <div className="h-20 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 flex items-center justify-center"><FileText size={16} className="text-neutral-300"/></div>
                    <div className="h-20 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 flex items-center justify-center"><Calendar size={16} className="text-neutral-300"/></div>
                  </div>
                  <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl space-y-2">
                    <div className="h-2 w-full bg-brand-200 rounded-full" />
                    <div className="h-2 w-2/3 bg-brand-200 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Accents */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 p-4 bg-neutral-0 rounded-2xl shadow-xl border border-brand-200 flex items-center gap-3 z-10"
            >
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white"><CheckCircle2 size={16}/></div>
              <div>
                <p className="text-[10px] text-neutral-400 font-bold">Status</p>
                <p className="text-xs font-light text-neutral-900">Live in Moments</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-widest rounded-full">Event Builder</span>
              <h2 className="text-4xl md:text-5xl font-light text-neutral-950 tracking-tight leading-tight">
                Host your event <br /> in minutes
              </h2>
              <p className="text-neutral-500 font-[300] text-md leading-relaxed">
                Just describe your idea – Our Event Builder will handle the layout, ticketing, and verification. Then use the drag-and-drop editor to customize. Whether it's a physical concert or a global hybrid summit, you'll be live in moments.
              </p>
            </div>

            <div className="pt-4 group cursor-pointer border-b border-brand-200 pb-4 flex items-center justify-between hover:border-brand-600 transition-colors">
              <span className="text-lg font-light text-neutral-900">Create with Event Builder</span>
              <ArrowRight className="text-neutral-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Zenvy / Features Section */}
      <section className="py-24 px-6 bg-brand-50/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-[1080px] mx-auto">
            <h2 className="text-3xl md:text-5xl font-light text-neutral-950 tracking-tight leading-tight">
              Freedom meets <br /> <span className="text-brand-600 font-normal">Uncompromising Security</span>
            </h2>
            <p className="text-neutral-500 font-[300] text-lg leading-relaxed">
              We bridged the trust gap. A platform where anyone can host, but strict protocols protect every attendee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <ShieldCheck className="text-emerald-500" />, 
                title: 'Verified Identity', 
                desc: 'Every organizer bypasses a rigorous identity audit. We don\'t just check emails; we verify legal docs & authenticity.' 
              },
              { 
                icon: <RefreshCcw className="text-blue-500" />, 
                title: '7-Day Refund', 
                desc: 'Automated 100% refunds for cancellations or unsafe events. No organizer approval needed.' 
              },
              { 
                icon: <Lock className="text-rose-500" />, 
                title: 'Locked Integrity', 
                desc: 'Organizers cannot secretly delete tiers, reduce quotas, or downgrade benefits once a ticket is sold.' 
              },
              { 
                icon: <Ticket className="text-amber-500" />, 
                title: 'Secure Booking', 
                desc: 'Anti-scalping limits, 15-min reservation locks, and dynamic QR codes that prevent duplicate entry.' 
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-neutral-0 p-8 rounded-[2rem] border border-neutral-100 hover:shadow-xl hover:shadow-brand-100/50 transition-all space-y-6 group"
              >
                <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                  {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 28, strokeWidth: 1.5 })}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-neutral-900 tracking-tight">{feature.title}</h3>
                  <p className="text-neutral-500 text-sm font-[300] leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Privacy Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-brand-50 rounded-[3rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />

          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 bg-neutral-0 rounded-xl shadow-sm flex items-center justify-center text-brand-600 border border-brand-200">
              <Fingerprint size={24} />
            </div>
            <h2 className="text-4xl font-light text-neutral-950 tracking-tight leading-tight">Engineering for <br /> Absolute Privacy.</h2>
            <p className="text-neutral-500 font-[300] leading-relaxed text-md">
              Documents are stored in private Backblaze S3 buckets with short TTL preview URLs generated only for authorized Admins. Not even the host can access files once submitted.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-neutral-0 px-6 py-4 rounded-2xl border border-brand-200 shadow-sm flex-1 min-w-[200px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">JWT Rotation</p>
                <p className="text-sm font-[300] text-neutral-950">15M TTL ACCESS</p>
              </div>
              <div className="bg-neutral-0 px-6 py-4 rounded-2xl border border-brand-200 shadow-sm flex-1 min-w-[200px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Rate Limiting</p>
                <p className="text-sm font-[300] text-neutral-950">DDOS GUARDED</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <motion.div
              className="w-72 h-72 rounded-full border-2 border-dashed border-brand-200 flex items-center justify-center relative"
            >
              <div className="w-56 h-56 rounded-full bg-white shadow-2xl flex items-center justify-center border border-brand-200">
                 <Logo variant="full" className="w-24 h-24 text-brand-600 opacity-80" strokeWidth="2" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>


    </div>
  );
};

