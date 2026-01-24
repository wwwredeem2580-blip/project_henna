'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Calendar, LogOut, Sparkles, CheckCircle2,
  Wallet, ShieldCheck, Zap, Activity, MessageCircle, ArrowRight,
  Globe, Fingerprint, Lock, Layers, BarChart3, Ticket,
  ShieldAlert, RefreshCcw, Bell, Star, X, Send, Palette, FileText,
  CreditCard
} from 'lucide-react';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { Logo } from '../shared/Logo';
import { Button } from '../ui/button';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
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

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-0 selection:bg-brand-100 selection:text-brand-700">
      {/* Navigation */}
      <Navbar onLogin={onLogin} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(103,61,230,0.06)_0%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-600 text-[10px] font-bold uppercase tracking-widest"
          >
            <Sparkles size={12} className="animate-pulse" />
            Human-led, AI-powered
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[42px] md:text-[56px] font-[300] text-neutral-950 tracking-tighter leading-[1.1]"
          >
            From Idea to Online, <br />
            <span className="text-brand-500 italic">Quicker and Slicker</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ lineHeight: '32px' }}
            className="text-[18px] font-light text-neutral-600 w-full mx-auto"
          >
            Top-notch precision for your events. Zenvy provides the infrastructure for high-end hybrid experiences, from automated payouts to encrypted document vaults.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
          >
            <Button 
              onClick={onGetStarted}
              variant="brand" 
              size="lg" 
              className="text-base h-14 px-8 rounded-xl shadow-xl shadow-brand-200/50 hover:-translate-y-1 active:translate-y-0"
            >
              Get started
            </Button>
            <Button 
              onClick={onLogin}
              variant="brand-outline" 
              size="lg" 
              className="text-base h-14 px-8 rounded-xl"
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Brand Showcase Section */}
      {/* <section className="py-16 px-6">
        <BrandPromotionVideo />
      </section> */}

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

      {/* Feature Highlights Section */}
      <section className="py-24 px-6 bg-brand-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-light text-neutral-950 tracking-tight">Features Engineered for Success</h2>
            <p className="text-neutral-500 font-[300] leading-relaxed">Professional tools without the professional complexity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Wallet />, title: 'Engraved Wallet', desc: 'Custom invitations with your name engraved, QR validation, and high-res PDF downloads.' },
              { icon: <ShieldCheck />, title: 'Verified Hosts', desc: 'Every organizer undergoes a multi-stage audit before their listing goes live.' },
              { icon: <BarChart3 />, title: 'Deep Analytics', desc: 'Real-time dashboards tracking orders, conversion rates, and check-in velocity.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-neutral-0 p-8 rounded-[2rem] border border-brand-200 shadow-sm hover:shadow-xl transition-all space-y-4"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <h3 className="text-xl font-light text-neutral-950 tracking-tight">{feature.title}</h3>
                <p className="text-neutral-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
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

      {/* Floating Zenny Chatbot */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-96 bg-neutral-0 rounded-[2rem] shadow-4xl border border-brand-200 overflow-hidden flex flex-col h-[500px]"
            >
              <div className="bg-brand-600 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Logo className="w-6 h-6 text-white" strokeWidth="2.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Zenny</h4>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">AI Agent</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-neutral-0/10 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-neutral-50/50">
                <div className="bg-neutral-0 p-4 rounded-2xl border border-brand-200 text-sm text-neutral-600 font-medium max-w-[85%] shadow-sm">
                  Hi there! I'm Zenny. I can help you find the best plan for your event. What's on your mind?
                </div>
              </div>
              <div className="p-4 border-t border-brand-200 bg-neutral-0 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Zenny..."
                  className="flex-1 bg-neutral-50 border border-transparent focus:border-brand-600 rounded-xl px-4 py-3 outline-none text-sm font-medium transition-all"
                />
                <button className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 transition-all">
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-3xl shadow-brand-500/40 z-[100] border-4 border-white relative"
        >
          {isChatOpen ? <X size={28} /> : <Logo className="w-8 h-8 text-white" strokeWidth="2.5" />}
          {!isChatOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </motion.button>
      </div>

      {/* Actual Footer */}
      <Footer />
    </div>
  );
};

