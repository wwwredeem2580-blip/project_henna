'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
  HelpCircle,
  Plus,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth';
import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';
import { hostAnalyticsService, HostOrder } from '@/lib/api/host-analytics';
import { hostEventsService } from '@/lib/api/host';

interface OrderFilters {
  eventId?: string;
  status?: string;
  search?: string;
}

interface OrdersProps {
  onLogout?: () => void;
}

export default function Orders({ onLogout }: OrdersProps) {
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [orders, setOrders] = useState<HostOrder[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const limit = 10;

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-600' },
    { value: 'refunded', label: 'Refunded', color: 'bg-amber-100 text-amber-600' }
  ];

  // Fetch events for filter dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await hostEventsService.getHostEvents({ 
          limit: 100, 
          page: 1, 
          filters: {} 
        });
        setEvents(eventsData.events || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch orders when page or filters change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await hostAnalyticsService.getHostOrders(currentPage, limit, filters);
      setOrders(data.orders || []);
      setTotalPages(data.pagination.pages);
      setTotalOrders(data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  const handleSearch = () => {
    handleFilterChange('search', searchQuery.trim());
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilter = (key: keyof OrderFilters) => {
    handleFilterChange(key, '');
    if (key === 'search') {
      setSearchQuery('');
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? (
      <span className={`px-2 py-1 whitespace-nowrap rounded-full text-[10px] font-bold uppercase tracking-wider ${option.color}`}>
        {option.label}
      </span>
    ) : (
      <span className="px-2 py-1 whitespace-nowrap rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
        {status}
      </span>
    );
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Orders</h1>
            <p className="text-sm text-slate-500 font-[300]">Manage and track all your event orders</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <button title='Create Event' onClick={() => router.push('/host/events/create')} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Plus size={18}/></button>
            <button title='Analytics' onClick={() => router.push('/host/analytics')} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><BarChart3 size={18}/></button>
            <button title='Help' onClick={() => router.push('/host/help')} className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0 flex gap-2">
              <input
                type="text"
                placeholder="Search by order number or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none"
              />
              <button 
                onClick={handleSearch} 
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-600 text-sm font-[300] py-2 pl-4 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Event Filter */}
              <div className="relative">
                <select
                  value={filters.eventId || ''}
                  onChange={(e) => handleFilterChange('eventId', e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-600 text-sm font-[300] py-2 pl-4 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500"
                >
                  <option value="">All Events</option>
                  {events.map(event => (
                    <option key={event.eventId} value={event.eventId}>{event.title}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.map(([key, value]) => {
                let label = value;
                if (key === 'status') {
                  label = statusOptions.find(opt => opt.value === value)?.label || value;
                } else if (key === 'eventId') {
                  const event = events.find(e => e.eventId === value);
                  label = event?.title || value;
                } else if (key === 'search') {
                  label = `Search: ${value}`;
                }

                return (
                  <div key={key} className="flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-sm font-[300]">
                    <span>{label}</span>
                    <button
                      onClick={() => clearFilter(key as keyof OrderFilters)}
                      className="hover:bg-brand-100 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-[300]">No orders found</p>
          </div>
        ) : (
          <>
            <div className="bg-white overflow-x-auto rounded-[1.5rem] border border-slate-100 overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">Order</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">Event</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">Buyer</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tickets</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order.orderNumber} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-[400] text-slate-700">{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-[300] text-slate-700">{order.eventTitle}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-[300] text-slate-500">{order.buyerEmail}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-[400] text-slate-900">{order.ticketCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-[400] text-slate-900">
                          <BDTIcon className="inline text-xs" /> {order.total}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-[300] text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 font-[300]">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalOrders)} of {totalOrders} orders
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-[400] transition-colors ${
                            pageNum === currentPage
                              ? 'bg-brand-500 text-white'
                              : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
