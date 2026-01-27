'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { publicService } from "@/lib/api/public";
import { Logo } from "../shared/Logo";
import { Search, X, ChevronDown, User, Wallet, Clock, Clock10 } from "lucide-react";


import React from 'react';
import { motion } from 'framer-motion';
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
import { BDTIcon, LightningIcon } from "../ui/Icons";

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Explore Events</h1>
            <p className="text-sm text-slate-500 font-[300]">Browse all the events handpicked for you</p>
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
        {/* Trending */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-[300] text-slate-900 tracking-tight">🔥 Trending</h2>
            <p className="text-xs text-slate-500 font-[300]">Events everybody's hooking up right now!</p>
          </div>

          <div className="grid pb-4 grid-flow-col auto-cols-[250px] gap-6 overflow-x-scroll scroll-smooth mb-10">
            {[
              { label: 'Active Events', value: '11', icon: <Calendar size={18}/> },
              { label: 'Pipeline Value', value: '$847', icon: <Plus size={18}/>, prefix: '$' },
              { label: 'Checked-in', value: '5', icon: <UserCircle size={18}/> },
              { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
              { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
              { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
              { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
              { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },

            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-0 bg-slate-50 border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden"
              >
                <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                  <img
                    src={'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                    alt={'Event Cover Image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 gap-2 left-4 flex items-center ">
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                      <div className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full mr-2"></div>
                      Live
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 ml-[-12px] mb-2">
                    <div className="flex items-center gap-1 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                      🔥 Trending
                    </div>
                  </div>
                  <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Event Name</h2>
                  <p className="text-xs text-slate-500 font-[300] line-clamp-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque illum rem quam consequatur tempora maxime perspiciatis, dolorum hic aut perferendis culpa iure eveniet voluptas exercitationem aspernatur earum, praesentium unde ea.</p>
                  <div className="flex flex-col gap-2 mt-2 font-[400] text-neutral-700">
                    <span className="flex items-center gap-1 text-xs ">
                      <Calendar size={12} strokeWidth={1}/>
                      26 Jan 2026
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <Clock10 size={12} strokeWidth={1}/>
                      9:00 AM - 5:00 PM
                    </span>
                  </div>
                  {/* Price */}
                  <div className="flex justify-between items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500 font-[300]">
                      Only {Math.floor(Math.random() * 100)} tickets lest
                    </span>
                    <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                      <span className="text-xs">From</span> <BDTIcon className="text-xs"/>100
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              </motion.div>
            ))}
          </div>
        </section>
        {/* Featured */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-1 text-lg font-[300] text-slate-900 tracking-tight"><Logo className="w-6 text-brand-500" /> Featured</h2>
                <p className="text-xs text-slate-500 font-[300]">Featured by Zenvy team</p>
              </div>
              <button className="text-[12px] font-[300] text-slate-400 hover:text-slate-900 transition-colors tracking-tight">See more</button>
            </div>

            <div className="grid pb-4 grid-flow-col auto-cols-[250px] gap-6 overflow-x-scroll scroll-smooth mb-10">
              {[
                { label: 'Active Events', value: '11', icon: <Calendar size={18}/> },
                { label: 'Pipeline Value', value: '$847', icon: <Plus size={18}/>, prefix: '$' },
                { label: 'Checked-in', value: '5', icon: <UserCircle size={18}/> },
                { label: 'Total Revenue', value: '$148.94', icon: <ShoppingBag size={18}/>, prefix: '$' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-0 bg-slate-50 border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden"
                >
                  <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                    <img
                      src={'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                      alt={'Event Cover Image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 gap-2 left-4 flex items-center ">
                      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                        <div className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full mr-2"></div>
                        Live
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 ml-[-12px] mb-2">
                      <div className="flex items-center gap-1 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                        <Logo className="w-4 text-brand-500" /> Featured
                      </div>
                    </div>
                    <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Event Name</h2>
                    <p className="text-xs text-slate-500 font-[300] line-clamp-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque illum rem quam consequatur tempora maxime perspiciatis, dolorum hic aut perferendis culpa iure eveniet voluptas exercitationem aspernatur earum, praesentium unde ea.</p>
                    <div className="flex flex-col gap-2 mt-2 font-[400] text-neutral-700">
                      <span className="flex items-center gap-1 text-xs ">
                        <Calendar size={12} strokeWidth={1}/>
                        26 Jan 2026
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock10 size={12} strokeWidth={1}/>
                        9:00 AM - 5:00 PM
                      </span>
                    </div>
                    {/* Price */}
                    <div className="flex justify-between items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500 font-[300]">
                        Only {Math.floor(Math.random() * 100)} tickets lest
                      </span>
                      <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                        <span className="text-xs">From</span> <BDTIcon className="text-xs"/>100
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Events */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Explore</h2>
                <p className="text-xs text-slate-500 font-[300]">Choose what's best for you</p>
              </div>
              <button className="text-[12px] font-[300] text-slate-400 hover:text-slate-900 transition-colors tracking-tight">See more</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 mb-10">
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
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-0 bg-slate-50 border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden"
                >
                  <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                    <img
                      src={'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                      alt={'Event Cover Image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 gap-2 left-4 flex items-center ">
                      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                        <div className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full mr-2"></div>
                        Live
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 ml-[-12px] mb-2">
                    </div>
                    <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Event Name</h2>
                    <p className="text-xs text-slate-500 font-[300] line-clamp-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque illum rem quam consequatur tempora maxime perspiciatis, dolorum hic aut perferendis culpa iure eveniet voluptas exercitationem aspernatur earum, praesentium unde ea.</p>
                    <div className="flex flex-col gap-2 mt-2 font-[400] text-neutral-700">
                      <span className="flex items-center gap-1 text-xs ">
                        <Calendar size={12} strokeWidth={1}/>
                        26 Jan 2026
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock10 size={12} strokeWidth={1}/>
                        9:00 AM - 5:00 PM
                      </span>
                    </div>
                    {/* Price */}
                    <div className="flex justify-between items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500 font-[300]">
                        Only {Math.floor(Math.random() * 100)} tickets lest
                      </span>
                      <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                        <span className="text-xs">From</span> <BDTIcon className="text-xs"/>100
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                </motion.div>
              ))}
            </div>
          </section>
      </main>
    </div>
  );
};
