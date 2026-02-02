'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  BarChart3,
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
  FileText,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';
import { adminService, AdminOrder } from '@/lib/api/admin';
import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';
import { ActionModal } from '@/components/ui/ActionModal';
import { Input } from '@/components/ui/input';
import Switch from '@/components/ui/Switch';

interface OrderFilters {
  status?: string;
  search?: string;
}

export default function AdminOrders() {

  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Refund State
  const [refundReason, setRefundReason] = useState('');
  const [isPartialRefund, setIsPartialRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');

  // Action Modal State
  const [activeAction, setActiveAction] = useState<{
    type: 'refund' | 'view_details' | null;
    order: AdminOrder | null;
  }>({ type: null, order: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const limit = 10;

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'refunded', label: 'Refunded', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrders({page: currentPage, limit, filters});
      setOrders(data?.orders || []);
      setTotalPages(data?.pagination?.pages);
      setTotalOrders(data?.pagination?.total);
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

  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? (
      <span className={`px-2 py-1 text-xs font-[400] rounded-tr-lg rounded-bl-lg ${option.color}`}>
        {option.label}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-[400] rounded-tr-lg rounded-bl-lg border bg-slate-50 text-slate-700 border-slate-200">
        {status}
      </span>
    );
  };

  // Action Handlers
  const handleActionClick = (action: string, order: AdminOrder) => {
    setOpenMenuId(null); // Close menu
    
    switch (action) {
      case 'view_details':
        setActiveAction({ type: 'view_details', order });
        break;
      case 'refund':
        // Reset refund state
        setRefundReason('');
        setIsPartialRefund(false);
        setRefundAmount('');
        setActiveAction({ type: 'refund', order });
        break;
    }
  };

  const handleModalConfirm = async (reason?: string) => {
    if (!activeAction.order) return;
    
    // For view details, it's just a placeholder, so we return early
    if (activeAction.type === 'view_details') {
       setActiveAction({ type: null, order: null });
       return;
    }

    setActionLoading(true);
    try {
      if (activeAction.type === 'refund') {
        const orderId = activeAction.order.orderId;
        const amount = isPartialRefund ? Number(refundAmount) : undefined;
        await adminService.refundOrder(
          orderId, 
          amount, 
          refundReason, 
          isPartialRefund ? 'partial' : 'full'
        );
      }
      
      setActiveAction({ type: null, order: null });
      fetchOrders();
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
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Orders</h1>
            <p className="text-sm text-slate-500 font-[300]">Manage ticket orders and refunds</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
              <button title='Analytics' onClick={() => {router.push('/host/analytics')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><BarChart3 size={18}/></button>
              <button title='Help' onClick={() => {router.push('/host/help')}} className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
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
                  placeholder="Search by order #, email, or event ..."
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
                      onClick={() => clearFilter(key as keyof OrderFilters)}
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
            <div className="w-full overflow-visible">
              <table className="w-full min-w-[640px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Order #</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Event</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Buyer</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Tickets</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={order.eventTitle}>
                          {order.eventTitle}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.buyerEmail}
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-600 text-center">
                          {order.ticketCount}
                        </td>
                        <td className="px-6 py-4 text-sm font-[400] text-gray-900">
                          <BDTIcon /> {order.total}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 text-[11px] whitespace-nowrap text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="px-6 py-4 text-right relative action-menu-container">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === order.orderId ? null : order.orderId)}
                            className="p-2 text-gray-400 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-50 relative"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {openMenuId === order.orderId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                              >
                                <div className="py-1">
                                  <button onClick={() => handleActionClick('view_details', order)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                    <FileText size={14} /> View Details
                                  </button>
                                  
                                  {order.status === 'confirmed' && (
                                    <>
                                      <div className="h-px bg-slate-100 my-1" />
                                      <button onClick={() => handleActionClick('refund', order)} className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                        <RotateCcw size={14} /> Issue Refund
                                      </button>
                                    </>
                                  )}
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
                  {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalOrders)} of {totalOrders} orders
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

        {/* Action Modals */}
      <ActionModal
        isOpen={activeAction.type === 'refund'}
        onClose={() => setActiveAction({ type: null, order: null })}
        onConfirm={() => handleModalConfirm()}
        title="Issue Refund"
        description={`Are you sure you want to refund order #${activeAction.order?.orderNumber}? This will reverse the payment and invalidate the tickets.`}
        type="custom"
        confirmText="Confirm Refund"
        intent="danger"
        loading={actionLoading}
        disabled={!refundReason.trim() || (isPartialRefund && (!refundAmount || Number(refundAmount) > (activeAction.order?.total || 0) || Number(refundAmount) <= 0))}
      >
        <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Reason for refund</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. User requested, Event cancelled..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
               <Switch 
                  label="Partial Refund" 
                  checked={isPartialRefund} 
                  onChange={(checked) => {
                    setIsPartialRefund(checked);
                    if (!checked) setRefundAmount('');
                  }} 
                />
            </div>

            {isPartialRefund && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
               >
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    Refund Amount (Max: <BDTIcon className="inline w-3 h-3" /> {activeAction.order?.total})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">৳</span>
                  <Input 
                    type="number" 
                    value={refundAmount} 
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8 bg-white"
                    max={activeAction.order?.total}
                  />
                </div>
                {Number(refundAmount) > (activeAction.order?.total || 0) && (
                   <p className="text-xs text-rose-500 mt-1">Amount cannot exceed total order value</p>
                )}
             </motion.div>
            )}
        </div>
      </ActionModal>
      
      <ActionModal
        isOpen={activeAction.type === 'view_details'}
        onClose={() => setActiveAction({ type: null, order: null })}
        onConfirm={() => setActiveAction({ type: null, order: null })}
        title="Order Details"
        description={`Details for order #${activeAction.order?.orderNumber} (Placeholder). In the future this will show full ticket and payment info.`}
        type="confirm"
        confirmText="Close"
        intent="neutral"
        loading={false}
      />

    </div>
  );
};
