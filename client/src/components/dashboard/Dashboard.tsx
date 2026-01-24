'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Star,
  Trash2,
  UserCircle,
  HelpCircle,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  Menu,
  X
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

import { Logo } from '@/components/shared/Logo';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Dashboard', active: true },
    { icon: <MessageSquare size={18} strokeWidth={1} />, label: 'Conversation' },
    { icon: <Calendar size={18} strokeWidth={1} />, label: 'Events' },
    { icon: <ShoppingBag size={18} strokeWidth={1} />, label: 'Orders' },
    { icon: <BarChart3 size={18} strokeWidth={1} />, label: 'Analytics' },
    { icon: <Settings size={18} strokeWidth={1} />, label: 'Settings' },
  ];

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

          <div className="mt-8">
            <div className="flex items-center justify-between px-4 mb-4">
              <div className="text-[10px] font-[500] text-slate-400 uppercase tracking-widest">Domains</div>
              <button className="text-slate-400 hover:text-brand-500"><Plus size={14}/></button>
            </div>
            <ul className="space-y-1">
              {['zenvystudios.com', 'liveevents.pro', 'global-art.io'].map((domain) => (
                <li key={domain}>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-[500] text-neutral-500 hover:text-neutral-900 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-brand-200" />
                    {domain}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="text-[10px] font-[500] text-slate-400 uppercase tracking-widest mb-2 px-4">Options</div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-[500] text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
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
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 font-[300]">A detailed overview of your metrics, usage, customers and more</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <button className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Trash2 size={18}/></button>
            <button className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Star size={18}/></button>
            <button className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src="https://picsum.photos/seed/user1/100/100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
              className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 relative group overflow-hidden"
            >
              <div className="flex items-center gap-3 text-slate-400 mb-4 font-[500] text-[10px] uppercase tracking-widest">
                {stat.icon}
                {stat.label}
              </div>
              <div className="text-2xl font-[500] tracking-tight text-slate-900">{stat.value}</div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Usage */}
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Resource Usage</h2>
              <p className="text-xs text-slate-500 font-[300]">Your current plan metrics and limits</p>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Ticket Credits', current: 10, total: 10 },
                { label: 'Active Domains', current: 4, total: 10 },
                { label: 'Staff Contacts', current: 11, total: 20 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-[400] text-slate-950 uppercase tracking-wider">
                    <span>{item.label}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.current / item.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-slate-950 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[12px] font-[300] text-slate-400">
                    <span>{item.current}</span>
                    <span>{item.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Transactions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Recent Sales</h2>
                <p className="text-xs text-slate-500 font-[300]">Latest incoming ticket orders</p>
              </div>
              <button className="text-[12px] font-[300] text-slate-400 hover:text-slate-900 transition-colors tracking-tight">See more</button>
            </div>

            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-white border border-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-500">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <p className="text-[12px] font-[300] text-slate-900 uppercase tracking-wider">BESTCOOKIECO.COM</p>
                      <p className="text-[10px] font-[300] text-slate-400">Order #ZEN-982{i}</p>
                    </div>
                  </div>
                  <div className="text-[12px] font-[500] text-slate-900">$77.00</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
