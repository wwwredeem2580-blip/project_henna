'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { publicService } from "@/lib/api/public";
import { Logo } from "../shared/Logo";
import { Search, X, ChevronDown, User, Wallet, Clock, Clock10, Music, ShieldCheck, Building, Building2, Minus, QrCode } from "lucide-react";

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

export default function Events() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  let menuItems = [
    { icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Explore', active: true },
    { icon: <Calendar size={18} strokeWidth={1} />, label: 'My Events' },
    { icon: <ShoppingBag size={18} strokeWidth={1} />, label: 'Wallet' },
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
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Event Details</h1>
            <p className="text-sm text-slate-500 font-[300]">Comprehensive details about this event</p>
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
        


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-6">
          <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-0 bg-slate-50 border border-slate-100 relative group overflow-hidden"
              >
                <div className="grid grid-cols-[1fr_minmax(14vw,14vw)] md:grid-cols-[1fr_minmax(7vw,7vw)] lg:grid-cols-[1fr_minmax(5vw,5vw)] xl:grid-cols-[1fr_minmax(6vw,6vw)] 2xl:grid-cols-[1fr_minmax(7vw,7vw)] gap-4">
                  {/* Main Image */}
                  <div className="relative aspect-[2/1] overflow-hidden rounded-tr-lg rounded-bl-lg">
                    <img
                      src="https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60"
                      alt="Event Cover Image"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-light text-slate-900 border border-slate-100">
                        <span className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full" />
                        Live
                      </div>
                    </div>
                  </div>

                  {/* Vertical Gallery */}
                  <div className="flex flex-col gap-2 overflow-hidden">
                    {[
                      101,
                      102,
                      103,
                      104
                    ].map((id) => (
                      <div
                        key={id}
                        className="aspect-[2/1] overflow-hidden rounded-tr-sm rounded-bl-sm"
                      >
                        <img
                          src={`https://picsum.photos/id/${id}/200/120.jpg`}
                          alt="Gallery image"
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
                      Concert
                    </div>
                  </div>
                  <h2 className="text-lg font-[300] text-slate-700 tracking-tight">Event Name</h2>
                  <p className="text-sm text-neutral-500 font-[300] line-clamp-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque illum rem quam consequatur tempora maxime perspiciatis, dolorum hic aut perferendis culpa iure eveniet voluptas exercitationem aspernatur earum, praesentium unde ea.</p>
                  <div className="flex flex-col gap-2 mt-4 font-[300] text-slate-700">
                    <span className="flex items-center gap-2 text-sm ">
                      <Calendar className="text-neutral-600" size={14} strokeWidth={1}/>
                      26th Jan 2026
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <Clock10 className="text-neutral-600" size={14} strokeWidth={1}/>
                      9:00 AM - 5:00 PM
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
                          <p className="text-xs text-neutral-500 font-[300]">Rose View Hotel</p>
                          <p className="text-xs text-neutral-500 mt-[-4px] font-[300]">Dhaka, Bangladesh</p>
                        </div>
                      </div>
                    </div>
                    <button className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
                      Get Directions
                    </button>
                  </section>
                  <div className="flex flex-col gap-2 mt-6">
                    <p className="text-md font-[300] text-slate-700">
                      The Experience
                    </p>
                    <p className="text-xs font-[300] text-neutral-500">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis quibusdam inventore quaerat alias commodi dignissimos laborum tenetur esse atque! Obcaecati magnam qui amet neque quia labore non, porro sunt. Dolores.
                      Pariatur odit, unde ut voluptate reprehenderit laboriosam distinctio veniam expedita a hic, harum omnis magnam iure laudantium sed adipisci ullam dignissimos voluptates suscipit. Ipsum est qui cupiditate itaque aspernatur laboriosam?
                      Ex vitae assumenda, odit numquam commodi atque cum a distinctio maxime perspiciatis voluptate ad tenetur nostrum delectus exercitationem accusantium similique illum hic placeat eius repellat consequatur non. Id, blanditiis! Molestiae.
                    </p>
                  </div>

                  <section className="p-2 max-w-[400px] bg-brand-card rounded-tr-lg rounded-bl-lg border border-brand-divider flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-2xl bg-white border border-brand-divider overflow-hidden flex items-center justify-center">
                        <User className="w-5 h-5 text-brand-400" strokeWidth={1}/>
                      </div>
                      <div>
                        <p className="text-[10px] font-[500] uppercase tracking-widest text-neutral-600 mb-1">Organizer</p>
                        <div className="flex flex-col items-start">
                          <p className="text-xs text-neutral-500 font-[300]">Zenvy Studios</p>
                          <p className="text-xs text-brand-400 mt-[-4px] font-[300]">support@zenvystudios.com</p>
                        </div>
                      </div>
                    </div>
                    <button className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
                      Profile
                    </button>
                  </section>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="absolute top-36 left-0 w-24 h-24 bg-brand-500/5 rounded-full -ml-8 -mt-8 transition-transform group-hover:scale-110" />
              </motion.div>
        </section>
        {/* Tickets */}
        <section className="space-y-6 xl:mr-10 2xl:mr-20">
          <div className="text-right">
            <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Event Tickets</h2>
            <p className="text-xs text-slate-500 font-[300]">What are you doing! Book yours right now.</p>
          </div>

          {/* Stats Grid */}
          <div className="flex flex-col items-end gap-6 mb-10">
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
                className="px-6 py-4 flex items-center justify-between max-w-[350px] rounded-tr-lg rounded-bl-lg w-full bg-slate-50 border border-slate-100 relative group overflow-hidden"
              >
                <div>
                  <div className="flex gap-6 items-center justify-between">
                  <div>
                    <div className="text-md font-[400] tracking-wide text-neutral-700">
                      Basic Entry
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400 mb-4 font-[500] text-[10px] uppercase tracking-widest">
                      Event Name
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
                      <Minus size={12}/>
                    </button>
                    <span className="text-xs font-[400] text-neutral-500">0</span>
                    <button className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
                      <Plus size={12}/>
                    </button>
                  </div>
                </div>
                {/* Price */}
                <div className="flex flex-col items-start gap-2 mt-2">
                  <span className="text-xs text-slate-500 font-[300]">
                    Only {Math.floor(Math.random() * 100)} tickets lest
                  </span>
                  <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                    <span className="text-xs">From</span> <BDTIcon className="text-xs"/>100
                  </span>
                </div>
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <QrCode size={36} className="text-brand-400"/>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        </div>

        
        
      </main>
    </div>
  );
};