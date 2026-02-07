'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  X,
  ChevronDown,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  PauseCircle,
  PlayCircle,
  FileX,
  StarOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/api/admin';
import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';
import { ActionModal } from '@/components/ui/ActionModal';

interface EventFilters {
  status?: string;
  search?: string;
}

export default function AdminEvents() {

  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [events, setEvents] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Action Modal State
  const [activeAction, setActiveAction] = useState<{
    type: 'reject' | 'suspend' | 'delete' | 'withdraw' | null;
    event: any | null;
  }>({ type: null, event: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const limit = 10;

  const statusOptions = [
    { value: 'pending_approval', label: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'approved', label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'published', label: 'Published', color: 'bg-brand-50 text-brand-700 border-brand-200' },
    { value: 'live', label: 'Live', color: 'bg-brand-50 text-brand-700 border-brand-200' },
    { value: 'ended', label: 'Ended', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'flagged', label: 'Flagged', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  useEffect(() => {
    fetchEvents();
  }, [currentPage, filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await adminService.getEvents({page: currentPage, limit, filters});
      setEvents(data?.events || []);
      setTotalPages(data?.pagination?.pages);
      setTotalEvents(data?.pagination?.total);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
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

  const clearFilter = (key: keyof EventFilters) => {
    handleFilterChange(key, '');
    if (key === 'search') {
      setSearchQuery('');
    }
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? (
      <span className={`px-2 py-1 text-[10px] font-[400] rounded-tr-sm rounded-bl-sm ${option.color}`}>
        {option.label}
      </span>
    ) : (
      <span className="px-2 py-1 text-[10px] font-[400] rounded-tr-sm rounded-bl-sm border bg-slate-50 text-slate-700 border-slate-200">
        {status}
      </span>
    );
  };

  // Action Handlers
  const handleActionClick = (action: string, event: any) => {
    setOpenMenuId(null); // Close menu
    
    switch (action) {
      case 'approve':
        handleSimpleAction(async () => await adminService.approveEvent(event.eventId), 'Event approved successfully');
        break;
      case 'reject':
        setActiveAction({ type: 'reject', event });
        break;
      case 'withdraw':
        handleSimpleAction(async () => await adminService.withdrawEvent(event.eventId), 'Approval withdrawn successfully');
        break;
      case 'feature':
        handleSimpleAction(async () => await adminService.featureEvent(event.eventId, 10), 'Event featured successfully');
        break;
      case 'unfeature':
        handleSimpleAction(async () => await adminService.unfeatureEvent(event.eventId), 'Event unfeatured successfully');
        break;
      case 'suspend':
        setActiveAction({ type: 'suspend', event });
        break;
      case 'unsuspend':
        handleSimpleAction(async () => await adminService.unsuspendEvent(event.eventId), 'Event unsuspended successfully');
        break;
      case 'pause_sales':
        handleSimpleAction(async () => await adminService.toggleSales(event.eventId), 'Sales paused successfully');
        break;
      case 'resume_sales':
        handleSimpleAction(async () => await adminService.toggleSales(event.eventId), 'Sales resumed successfully');
        break;
      case 'hide':
        handleSimpleAction(async () => await adminService.toggleVisibility(event.eventId), 'Event hidden successfully');
        break;
      case 'display':
        handleSimpleAction(async () => await adminService.toggleVisibility(event.eventId), 'Event is now public');
        break;
      case 'delete':
        setActiveAction({ type: 'delete', event });
        break;
    }
  };

  const handleSimpleAction = async (actionFn: () => Promise<any>, successMessage: string) => {
    setActionLoading(true);
    try {
      await actionFn();
      // Refetch to update UI
      fetchEvents();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalConfirm = async (reason?: string) => {
    if (!activeAction.event) return;
    
    setActionLoading(true);
    try {
      if (activeAction.type === 'reject') {
        await adminService.rejectEvent(activeAction.event.eventId, reason || '');
      } else if (activeAction.type === 'suspend') {
        await adminService.suspendEvent(activeAction.event.eventId, reason || '');
      } else if (activeAction.type === 'delete') {
        await adminService.deleteEvent(activeAction.event.eventId);
      }
      
      setActiveAction({ type: null, event: null });
      fetchEvents();
    } catch (err) {
      console.error('Modal action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId && !(e.target as Element).closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Events</h1>
            <p className="text-sm text-slate-500 font-[300]">A detailed overview of all events</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
              <button title='Create Event' onClick={() => {router.push('/host/events/create')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Plus size={18}/></button>
              <button title='Analytics' onClick={() => {router.push('/host/analytics')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><BarChart3 size={18}/></button>
              <button title='Help' onClick={() => {router.push('/contact')}} className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="rounded-[24px] mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="flex-1 min-w-full md:min-w-[350px] flex gap-2">
                <input
                  type="text"
                  placeholder="Search by event name ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full font-[300] text-[14px] pl-4 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none"
                />
              {/* Search Button */}
              <button onClick={handleSearch} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                <Search size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 ">
              <div className="relative">
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="appearance-none bg-white border border-gray-100 text-gray-600 text-xs sm:text-sm font-normal py-1 sm:py-2 pl-4 pr-8 sm:pr-10 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.map(([key, value]) => {
                let label = value;
                if (key === 'status') {
                  label = `Status: ${value}`;
                } else if (key === 'search') {
                  label = `Search: ${value}`;
                }

                return (
                  <div key={key} className="flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm">
                    <span>{label as string}</span>
                    <button
                      onClick={() => clearFilter(key as keyof EventFilters)}
                      className="hover:bg-brand-100 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-10">
          <section className="space-y-6">
            <div className="bg-white overflow-x-auto overflow-y-auto rounded-[1.5rem] whitespace-nowrap  overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Event</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Host</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Sold</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Revenue</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Details</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    events.map((event: any) => (
                      <tr key={event.eventId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.coverImage || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60'}
                              className="w-10 h-10 rounded-tr-sm rounded-bl-sm object-cover"
                              alt=""
                            />
                            <div>
                              <p className="text-sm font-[400] text-neutral-700 truncate max-w-[150px]">
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
                          {getStatusBadge(event.status)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-[400] text-neutral-700">{event.hostId || 'N/A'}</span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-[400] text-neutral-700">
                              {event.ticketsSoldPercentage}%
                            </span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-500 rounded-full"
                                style={{ width: `${event.ticketsSoldPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-[400] text-slate-700"><BDTIcon /> {event.revenue}</span>
                        </td>

                        <td className="px-6 py-4 pl-10">
                          <button onClick={() => router.push(`/admin/events/${event.eventId}`)} className="text-xs font-[400] hover:text-brand-600 hover:scale-110 transition-all"><Eye size={14} strokeWidth={1.5}/></button>
                        </td>

                        <td className="px-6 py-4 text-right relative action-menu-container">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === event.eventId ? null : event.eventId)}
                            className="p-2 text-gray-400 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-50 relative"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {openMenuId === event.eventId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                              >
                                <div className="py-1">
                                  {event.status === 'pending_approval' && (
                                    <>
                                      <button onClick={() => handleActionClick('approve', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2">
                                        <CheckCircle size={14} /> Approve
                                      </button>
                                      <button onClick={() => handleActionClick('reject', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2">
                                        <XCircle size={14} /> Reject
                                      </button>
                                    </>
                                  )}
                                  
                                  {event.status === 'approved' && (
                                     <button onClick={() => handleActionClick('withdraw', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2">
                                        <FileX size={14} /> Withdraw Approval
                                      </button>
                                  )}

                                  {(event.status === 'published' || event.status === 'live') && (
                                    <>
                                      {event.isFeatured ? (
                                        <button onClick={() => handleActionClick('unfeature', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                          <StarOff size={14} /> Unfeature
                                        </button>
                                      ) : (
                                        <button onClick={() => handleActionClick('feature', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2">
                                          <Star size={14} /> Feature
                                        </button>
                                      )}

                                      {event.isSuspended ? (
                                        <button onClick={() => handleActionClick('unsuspend', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                                           <CheckCircle size={14} /> Unsuspend
                                        </button>
                                      ) : (
                                        <button onClick={() => handleActionClick('suspend', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2">
                                           <XCircle size={14} /> Suspend
                                        </button>
                                      )}

                                      {event.isSalesPaused ? (
                                        <button onClick={() => handleActionClick('resume_sales', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2">
                                           <PlayCircle size={14} /> Resume Sales
                                        </button>
                                      ) : (
                                        <button onClick={() => handleActionClick('pause_sales', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2">
                                           <PauseCircle size={14} /> Pause Sales
                                        </button>
                                      )}

                                      {event.visibility === 'unlisted' ? (
                                        <button onClick={() => handleActionClick('display', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                                           <Eye size={14} /> Display Event
                                        </button>
                                      ) : (
                                         <button onClick={() => handleActionClick('hide', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                           <EyeOff size={14} /> Hide Event
                                        </button>
                                      )}
                                    </>
                                  )}

                                  <div className="h-px bg-slate-100 my-1" />
                                  <button onClick={() => handleActionClick('delete', event)} className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                    <Trash2 size={14} /> Delete Event
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
          {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 font-[300]">
                  {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalEvents)} of {totalEvents} events
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-2 py-1 rounded-lg text-sm font-[400] transition-colors ${
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
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsRight size={14} />
                  </button>
                </div>
              </div>
            )}
        </div>
      </main>

      {/* Action Modals */}
      <ActionModal
        isOpen={activeAction.type === 'reject'}
        onClose={() => setActiveAction({ type: null, event: null })}
        onConfirm={handleModalConfirm}
        title="Reject Event"
        description={`Are you sure you want to reject "${activeAction.event?.title}"? Please provide a reason for rejection.`}
        type="input"
        inputPlaceholder="Reason for rejection..."
        confirmText="Reject Event"
        intent="danger"
        loading={actionLoading}
      />

      <ActionModal
        isOpen={activeAction.type === 'suspend'}
        onClose={() => setActiveAction({ type: null, event: null })}
        onConfirm={handleModalConfirm}
        title="Suspend Event"
        description={`Are you sure you want to suspend "${activeAction.event?.title}"? This will hide the event and pause sales. Please provide a reason.`}
        type="input"
        inputPlaceholder="Reason for suspension..."
        confirmText="Suspend Event"
        intent="danger"
        loading={actionLoading}
      />

      <ActionModal
        isOpen={activeAction.type === 'delete'}
        onClose={() => setActiveAction({ type: null, event: null })}
        onConfirm={handleModalConfirm}
        title="Delete Event"
        description={`Are you sure you want to permanently delete "${activeAction.event?.title}"? This action cannot be undone.`}
        type="confirm"
        confirmText="Delete Permanently"
        intent="danger"
        loading={actionLoading}
      />
    </div>
  );
};
