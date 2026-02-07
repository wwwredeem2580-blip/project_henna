'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';
import { hostAnalyticsService, DashboardMetrics, HostOrder } from '@/lib/api/host-analytics';
import { hostEventsService } from '@/lib/api/host';

interface DashboardProps {
  onLogout: () => void;
}

import { Logo } from '@/components/shared/Logo';

import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {

  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<HostOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch metrics, events, and recent orders in parallel
        const [metricsData, eventsData, ordersData] = await Promise.all([
          hostAnalyticsService.getDashboardMetrics(),
          hostEventsService.getHostEvents({ limit: 5, page: 1, filters: { status: 'published,live' } }),
          hostAnalyticsService.getHostOrders(1, 3)
        ]);

        setMetrics(metricsData);
        setEvents(eventsData.events || []);
        setRecentOrders(ordersData.orders || []);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
              <img onClick={() => {user?.role === 'host' ? router.push('/host/profile') : router.push('/wallet')}} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-10">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Today Revenue', value: metrics.recentActivity.revenueToday.toFixed(2), icon: <DollarSign size={18}/>, prefix: 'BDT' },
              { label: 'This Month Revenue', value: metrics.revenueByPeriod.thisMonth.toFixed(2), icon: <CreditCard size={18}/>, prefix: 'BDT' },
              { label: 'Total Orders', value: metrics.overview.totalOrders.toString(), icon: <ShoppingBag size={18}/> },
              { label: 'Tickets Sold', value: metrics.overview.totalTicketsSold.toString(), icon: <Ticket size={18}/> },
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
                <div className="text-lg font-[500] tracking-tight text-neutral-700"> 
                  <span className="text-xs font-[400] text-slate-400">{stat.prefix} </span>
                  {stat.value}
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              </motion.div>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Events */}
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Recent Events</h2>
              <p className="text-xs text-slate-500 font-[300]">Your current plan metrics and limits</p>
            </div>

            {/* scroll container */}
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[640px] text-left border-collapse">
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
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                        No upcoming events found
                      </td>
                    </tr>
                  ) : (
                    events.map((event: any) => (
                      <tr key={event.eventId} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.coverImage || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60'}
                              className="w-10 h-10 rounded-tr-sm rounded-bl-sm object-cover"
                              alt=""
                            />
                            <div>
                              <p className="text-sm font-[500] text-neutral-700 truncate max-w-[150px]">
                                {event.title}
                              </p>
                              <p className="text-[10px] whitespace-nowrap text-slate-400">
                                {new Date(event.startDate).toLocaleDateString('en-US', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 whitespace-nowrap rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              event.status === 'live'
                                ? 'bg-green-100 text-green-600'
                                : event.status === 'published'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-amber-100 text-amber-600'
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-[400] text-gray-700">
                              {event.ticketsSoldPercentage}%
                            </span>
                            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-500 rounded-full"
                                style={{ width: `${event.ticketsSoldPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm font-[400] text-gray-900">
                          <BDTIcon /> {event.revenue}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => router.push(`/host/events/manage/${event.eventId}`)}
                            className="p-2 text-gray-400 hover:text-brand-600 transition-colors"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No recent sales
                </div>
              ) : (
                recentOrders.map((order, i) => (
                <div key={i} className="p-4 bg-white border border-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-500">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <p className="text-[12px] font-[300] text-slate-900 uppercase tracking-wider">{order.eventTitle}</p>
                      <p className="text-[10px] font-[300] text-slate-400">{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-[12px] font-[500] text-slate-900"><BDTIcon className="text-xs inline"/>{order.total}</div>
                </div>
              ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
