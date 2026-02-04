'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HelpCircle,
  BarChart3,
  Loader2,
  X,
  ChevronDown,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';
import { adminService, AdminTicket, AdminTicketFilters } from '@/lib/api/admin';
import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';
import { ActionModal } from '@/components/ui/ActionModal';
import { Input } from '@/components/ui/input';

export default function AdminTickets() {
  const { user } = useAuth();
  const router = useRouter();
  const observerTarget = useRef<HTMLDivElement>(null);

  // State management
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<AdminTicketFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Action Modal State
  const [activeAction, setActiveAction] = useState<{
    type: 'view_details' | 'change_status' | 'check_in' | null;
    ticket: AdminTicket | null;
  }>({ type: null, ticket: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Status change state
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const limit = 50;

  const ticketStatusOptions = [
    { value: 'valid', label: 'Valid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'used', label: 'Used', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'refunded', label: 'Refunded', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: 'transferred', label: 'Transferred', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  const checkInStatusOptions = [
    { value: 'not_checked_in', label: 'Not Checked In', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'checked_in', label: 'Checked In', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  // Status transition rules (client-side validation)
  const getAllowedTransitions = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      valid: ['cancelled', 'refunded'],
      used: [], // Cannot change from used
      cancelled: [], // Cannot reactivate
      refunded: [], // Cannot reactivate
      transferred: ['cancelled'],
    };
    return transitions[currentStatus] || [];
  };

  // Initial fetch
  useEffect(() => {
    fetchTickets(true);
  }, [filters]);

  // WebSocket for real-time updates
  useEffect(() => {
    // TODO: Implement WebSocket connection
    // const ws = new WebSocket('ws://localhost:3001');
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'TICKET_UPDATED') {
    //     updateTicketInList(data.ticket);
    //   }
    // };
    // return () => ws.close();
  }, []);

  const fetchTickets = async (reset = false) => {
    const cursor = reset ? null : nextCursor;
    
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await adminService.getTickets({
        cursor,
        limit,
        filters,
      });

      if (reset) {
        setTickets(data.tickets || []);
      } else {
        setTickets((prev) => [...prev, ...(data.tickets || [])]);
      }

      setNextCursor(data.pagination.nextCursor);
      setHasMore(data.pagination.hasMore);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch tickets:', err);
      setError(err.message || 'Failed to load tickets');
      if (reset) setTickets([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTickets(false);
    }
  };

  const handleFilterChange = (key: keyof AdminTicketFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value) {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setShowFilterModal(false);
  };

  const activeFiltersCount = Object.keys(filters).filter((key) => filters[key as keyof AdminTicketFilters]).length;

  const getStatusBadge = (status: string, type: 'ticket' | 'checkIn') => {
    const options = type === 'ticket' ? ticketStatusOptions : checkInStatusOptions;
    const option = options.find((opt) => opt.value === status);
    return option ? (
      <span className={`px-2 py-1 text-[10px] font-[400] rounded-tr-sm rounded-bl-sm border ${option.color}`}>
        {option.label}
      </span>
    ) : (
      <span className="px-2 py-1 text-[10px] font-[400] rounded-tr-sm rounded-bl-sm border bg-slate-50 text-slate-700 border-slate-200">
        {status}
      </span>
    );
  };

  // Action Handlers
  const handleActionClick = (action: string, ticket: AdminTicket) => {
    setOpenMenuId(null);

    switch (action) {
      case 'view_details':
        setActiveAction({ type: 'view_details', ticket });
        break;
      case 'change_status':
        setNewStatus('');
        setStatusReason('');
        setActiveAction({ type: 'change_status', ticket });
        break;
      case 'check_in':
        setActiveAction({ type: 'check_in', ticket });
        break;
    }
  };

  const handleModalConfirm = async () => {
    if (!activeAction.ticket || !user?.sub) return;

    setActionLoading(true);
    try {
      if (activeAction.type === 'change_status') {
        await adminService.updateTicketStatus(
          activeAction.ticket._id,
          newStatus,
          user.sub,
          statusReason || undefined
        );
      } else if (activeAction.type === 'check_in') {
        await adminService.manualCheckIn(activeAction.ticket._id, user.sub);
      }

      setActiveAction({ type: null, ticket: null });
      fetchTickets(true); // Refresh list
    } catch (err: any) {
      console.error('Action failed:', err);
      setError(err.message || 'Operation failed');
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
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Tickets</h1>
            <p className="text-sm text-slate-500 font-[300]">
              Manage ticket status and check-ins
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <button
              title="Analytics"
              onClick={() => router.push('/admin/analytics')}
              className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"
            >
              <BarChart3 size={18} />
            </button>
            <button
              title="Help"
              onClick={() => router.push('/admin/help')}
              className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"
            >
              <HelpCircle size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="rounded-[24px] mb-6">
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal size={16} />
              <span className="text-sm font-[400]">Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-brand-500 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Clear all
              </button>
            )}

            <button
              onClick={() => fetchTickets(true)}
              disabled={loading}
              className="ml-auto p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                let label = `${key}: ${value}`;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm"
                  >
                    <span>{label}</span>
                    <button
                      onClick={() => handleFilterChange(key as keyof AdminTicketFilters, '')}
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

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-rose-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchTickets(true)}
              className="px-3 py-1 bg-rose-600 text-white text-xs rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white overflow-x-auto rounded-[1.5rem] border border-slate-100 mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">
                  Ticket #
                </th>
                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">
                  Event
                </th>
                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">
                  Buyer
                </th>
                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">
                  Type
                </th>
                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">
                  Check-In
                </th>
                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">
                  Issued
                </th>
                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={48} className="text-slate-300" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">No tickets found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {activeFiltersCount > 0
                            ? 'Try adjusting your filters'
                            : 'Tickets will appear here once created'}
                        </p>
                      </div>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-2 px-4 py-2 text-sm text-brand-600 hover:text-brand-700 underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-[500] text-slate-700">
                          {ticket.ticketNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4" title={ticket.eventTitle}>
                        <span className="text-xs font-[400] text-slate-700 line-clamp-1">
                          {ticket.eventTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-[400] text-slate-700">{ticket.buyerEmail}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-[400] text-slate-700">{ticket.ticketType}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(ticket.status, 'ticket')}</td>
                      <td className="px-6 py-4">{getStatusBadge(ticket.checkInStatus, 'checkIn')}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-[400] text-slate-700">
                          {new Date(ticket.issuedAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right relative action-menu-container">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === ticket._id ? null : ticket._id)}
                          className="p-2 text-gray-400 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-50"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {openMenuId === ticket._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => handleActionClick('view_details', ticket)}
                                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Eye size={14} /> View Details
                                </button>

                                {getAllowedTransitions(ticket.status).length > 0 && (
                                  <>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                      onClick={() => handleActionClick('change_status', ticket)}
                                      className="w-full text-left px-4 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                    >
                                      <RefreshCw size={14} /> Change Status
                                    </button>
                                  </>
                                )}

                                {ticket.checkInStatus === 'not_checked_in' && ticket.status === 'valid' && (
                                  <>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                      onClick={() => handleActionClick('check_in', ticket)}
                                      className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                    >
                                      <CheckCircle size={14} /> Manual Check-In
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load More Tickets</span>
              )}
            </button>
          </div>
        )}

        {/* Showing count */}
        {tickets.length > 0 && (
          <div className="text-center text-sm text-slate-500">
            Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            {hasMore && ' • More available'}
          </div>
        )}
      </main>

      {/* Advanced Filters Modal */}
      <ActionModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onConfirm={() => setShowFilterModal(false)}
        title="Advanced Filters"
        description="Filter tickets by multiple criteria"
        type="custom"
        confirmText="Apply Filters"
        intent="neutral"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Statuses</option>
              {ticketStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Buyer Email</label>
            <Input
              type="email"
              value={filters.email || ''}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="buyer@example.com"
              className="bg-slate-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Ticket Number</label>
            <Input
              type="text"
              value={filters.ticketNumber || ''}
              onChange={(e) => handleFilterChange('ticketNumber', e.target.value)}
              placeholder="TKT-..."
              className="bg-slate-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Order ID</label>
            <Input
              type="text"
              value={filters.orderId || ''}
              onChange={(e) => handleFilterChange('orderId', e.target.value)}
              placeholder="65a1b2c3d4e5f6g7h8i9j0k1"
              className="bg-slate-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Event ID</label>
            <Input
              type="text"
              value={filters.eventId || ''}
              onChange={(e) => handleFilterChange('eventId', e.target.value)}
              placeholder="65a1b2c3d4e5f6g7h8i9j0k1"
              className="bg-slate-50"
            />
          </div>
        </div>
      </ActionModal>

      {/* View Details Modal */}
      <ActionModal
        isOpen={activeAction.type === 'view_details'}
        onClose={() => setActiveAction({ type: null, ticket: null })}
        onConfirm={() => setActiveAction({ type: null, ticket: null })}
        title="Ticket Details"
        description={`Full details for ${activeAction.ticket?.ticketNumber}`}
        type="custom"
        confirmText="Close"
        intent="neutral"
      >
        {activeAction.ticket && (
          <div className="space-y-3 pt-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500">Ticket Number</span>
                <p className="font-mono font-medium">{activeAction.ticket.ticketNumber}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Order Number</span>
                <p className="font-medium">{activeAction.ticket.orderNumber}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Buyer Email</span>
                <p>{activeAction.ticket.buyerEmail}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Price</span>
                <p>
                  <BDTIcon className="inline w-3 h-3" /> {activeAction.ticket.price}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Payment Status</span>
                <p className="capitalize">{activeAction.ticket.paymentStatus}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Valid Until</span>
                <p>
                  {new Date(activeAction.ticket.validUntil).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </ActionModal>

      {/* Change Status Modal */}
      <ActionModal
        isOpen={activeAction.type === 'change_status'}
        onClose={() => setActiveAction({ type: null, ticket: null })}
        onConfirm={handleModalConfirm}
        title="Change Ticket Status"
        description={`Update status for ${activeAction.ticket?.ticketNumber}`}
        type="custom"
        confirmText="Update Status"
        intent="danger"
        loading={actionLoading}
        disabled={!newStatus}
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500">Current Status</span>
            <p className="font-medium mt-1 capitalize">{activeAction.ticket?.status}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select status...</option>
              {getAllowedTransitions(activeAction.ticket?.status || '').map((status) => (
                <option key={status} value={status}>
                  {ticketStatusOptions.find((opt) => opt.value === status)?.label || status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              Reason (Optional)
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="e.g., Customer requested cancellation"
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Status changes are logged and cannot be undone. Ensure this action is
              intentional.
            </p>
          </div>
        </div>
      </ActionModal>

      {/* Manual Check-In Modal */}
      <ActionModal
        isOpen={activeAction.type === 'check_in'}
        onClose={() => setActiveAction({ type: null, ticket: null })}
        onConfirm={handleModalConfirm}
        title="Manual Check-In"
        description={`Manually check in ticket ${activeAction.ticket?.ticketNumber}?`}
        type="confirm"
        confirmText="Confirm Check-In"
        intent="primary"
        loading={actionLoading}
      >
        <div className="space-y-3 pt-2">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800">
              This will mark the ticket as <strong>checked in</strong>. This action is irreversible and will
              be logged with your admin ID.
            </p>
          </div>
          {activeAction.ticket && (
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket:</span>
                <span className="font-mono font-medium">{activeAction.ticket.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer:</span>
                <span>{activeAction.ticket.buyerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Event:</span>
                <span className="text-right">{activeAction.ticket.eventTitle}</span>
              </div>
            </div>
          )}
        </div>
      </ActionModal>
    </div>
  );
}
