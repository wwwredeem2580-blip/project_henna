'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ShoppingBag,
  Star,
  Trash2,
  UserCircle,
  HelpCircle,
  Plus,
  LogIn,
  UserPlus,
  PlusCircle,
  BarChart3,
  Ticket,
  DollarSign,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';

interface DashboardProps {
  onLogout: () => void;
}

import { Logo } from '@/components/shared/Logo';

import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {

  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 font-[300]">A detailed overview of your metrics, usage, customers and more</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
              <button title='Create Event' onClick={() => {router.push('/host/events/create')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Plus size={18}/></button>
              <button title='Analytics' onClick={() => {router.push('/host/analytics')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><BarChart3 size={18}/></button>
              <button title='Help' onClick={() => {router.push('/host/help')}} className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Today Revenue', value: '148.94', icon: <DollarSign size={18}/>, prefix: 'BDT' },
            { label: 'This Month Revenue', value: '385.00', icon: <CreditCard size={18}/>, prefix: 'BDT' },
            { label: 'Total Orders', value: '5', icon: <ShoppingBag size={18}/> },
            { label: 'Tickets Sold', value: '11', icon: <Ticket size={18}/> },
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
              <div className="text-2xl font-[500] tracking-tight text-neutral-700"> 
                <span className="text-sm font-[400] text-slate-400">{stat.prefix} </span>
                {stat.value}
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Usage */}
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Upcoming Events</h2>
              <p className="text-xs text-slate-500 font-[300]">Your current plan metrics and limits</p>
            </div>

            <table className="w-full text-left border-collapse overflow-x-auto">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Event</th>
                  <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sold</th>
                  <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Revenue</th>
                  <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[{eventId: '1', title: 'Event 1', status: 'live', startDate: '2022-01-01', ticketsSoldPercentage: 50, revenue: 100, coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXZlbnR8ZW58MHx8MHx8fDA%3D'}].map((event: any) => (
                  <tr key={event.eventId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={event.coverImage} className="w-10 h-10 rounded-tr-sm rounded-bl-sm object-cover" alt="" />
                        <div>
                          <p className="text-sm font-[500] text-neutral-700 truncate max-w-[150px]">{event.title}</p>
                          <p className="text-[10px] whitespace-nowrap text-slate-400">{new Date(event.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 whitespace-nowrap rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        event.status === 'live' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-[400] text-gray-700">{event.ticketsSoldPercentage}%</span>
                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-brand-500 rounded-full`} style={{ width: `${event.ticketsSoldPercentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-[400] text-gray-900">
                      <BDTIcon /> {event.revenue}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-brand-600 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
