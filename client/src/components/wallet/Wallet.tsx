'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { publicService } from "@/lib/api/public";
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const router = useRouter();

  let menuItems = [
    { icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Explore' },
    { icon: <Calendar size={18} strokeWidth={1} />, label: 'My Events' },
    { icon: <ShoppingBag size={18} strokeWidth={1} />, label: 'Wallet', active: true },
    { icon: <User size={18} strokeWidth={1} />, label: 'Profile' },
    { icon: <Settings size={18} strokeWidth={1} />, label: 'Settings' },
  ];

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {[
                { label: 'Active Events', value: '11', icon: <Calendar size={18}/> },
                { label: 'Pipeline Value', value: '$847', icon: <Plus size={18}/>, prefix: '$' },
                { label: 'Checked-in', value: '5', icon: <UserCircle size={18}/> },
                { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
                { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
                { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
                { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
                { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
                { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
                { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },

              ].map((stat, i) => (
            <div key={i}>
              <div
                onClick={() => setExpandedId(expandedId === i ? null : i)}
                className='max-w-[90vw] group cursor-pointer transition-all duration-300 p-4 flex items-center gap-0 overflow-hidden relative select-none'
              >
                <div className='rounded-tr-lg rounded-bl-lg overflow-hidden shrink-0 relative bg-slate-100 w-24 h-24'>
                  <img src='https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60' alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>

                <div className="px-6 py-4 w-full h-full flex flex-col gap-1 relative">
                    <div className="text-md font-[400] line-clamp-2 tracking-wide text-neutral-700">
                      Summer festival 2026
                    </div>
                    <div className="text-neutral-400 line-clamp-2 font-[500] text-[10px] uppercase tracking-widest">
                      Rose View Hotel, Sylhet
                    </div>
                    <div className="mt-2">
                      <div className="text-neutral-400 font-[500] line-clamp-2 text-[10px] uppercase tracking-widest">
                        25 Jan, 2026
                      </div>
                      <div className="text-neutral-400 font-[500] line-clamp-2 text-[10px] uppercase tracking-widest">
                        12:00 PM - 10:00 PM
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 line-clamp-1 font-[300]">
                      Only 5 Days Left
                    </span>
                    <div className="mt-2">
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="border text-[10px] sm:text-xs font-[300] hover:scale-103 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                      >
                        <DownloadIcon size={12} />
                        Download All
                      </button>
                    </div>

                  <div className="absolute bottom-18 right-2 transition-transform pointer-events-none">
                    <ChevronDown size={24} className={`group-hover:scale-120 transition-transform duration-300 ${expandedId === i ? 'rotate-180' : ''}`} strokeWidth={1}/>
                  </div>
                </div>
              </div>
              {/*Tickets*/}
              <AnimatePresence>
                {expandedId === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 max-w-full pb-6 overflow-x-auto">
                <div className="flex gap-4">
                  <div className="min-w-[300px] w-[300px]">
                    <TicketCard  ticket={{
                      _id: i.toString(),
                      tier: 'Basic Entry',
                      name: 'Event Name',
                      controls: false,
                      startDate: '25 Jan, 2026',
                      endDate: '26 Jan, 2026',
                      startTime: '10:00 AM',
                      endTime: '4:00 PM',
                      price: Math.floor(Math.random() * 3000),
                      quantity: Math.floor(Math.random() * 100),
                      benefits: [
                        'Access to VIP lounge',
                        'Dedicated entrance',
                        'Premium food & beverage',
                      ],
                      venue: 'Rose View Hotel, Sylhet',
                      onClick: () => {},
                    }}
                    />
                    <div className="flex text-xs font-[400] text-slate-500 items-center gap-2 mt-2 justify-center">
                      <button className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm">
                        <DownloadIcon size={12} />
                        QR Image
                      </button>
                      <button className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm">
                        <FileText size={12} />
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="min-w-[300px] w-[300px]">
                    <TicketCard  ticket={{
                      _id: i.toString(),
                      tier: 'Basic Entry',
                      name: 'Event Name',
                      controls: false,
                      startDate: '25 Jan, 2026',
                      endDate: '26 Jan, 2026',
                      startTime: '10:00 AM',
                      endTime: '4:00 PM',
                      price: Math.floor(Math.random() * 3000),
                      quantity: Math.floor(Math.random() * 100),
                      benefits: [
                        'Access to VIP lounge',
                        'Dedicated entrance',
                        'Premium food & beverage',
                      ],
                      venue: 'Rose View Hotel, Sylhet',
                      onClick: () => {},
                    }}
                    />
                    <div className="flex text-xs font-[400] text-slate-500 items-center gap-2 mt-2 justify-center">
                      <button className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm">
                        <DownloadIcon size={12} />
                        QR Image
                      </button>
                      <button className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm">
                        <FileText size={12} />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
                </motion.div>
                )}
              </AnimatePresence>
            </div>
            ))}
            </div>
          </section>
      </main>
    </div>
  );
};
