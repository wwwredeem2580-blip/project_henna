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
import { adminService, AdminPayout } from '@/lib/api/admin';
import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';
import { ActionModal } from '@/components/ui/ActionModal';
import { Input } from '@/components/ui/input';
import Switch from '@/components/ui/Switch';

interface OrderFilters {
  status?: string;
  search?: string;
}

export default function AdminPayouts() {

  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Action State
  const [actionReason, setActionReason] = useState('');

  // Action Modal State
  const [activeAction, setActiveAction] = useState<{
    type: 'approve' | 'reject' | 'hold' | 'process' | 'view_details' | null;
    payout: AdminPayout | null;
  }>({ type: null, payout: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const limit = 10;

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'approved', label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'completed', label: 'Completed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { value: 'failed', label: 'Failed', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  useEffect(() => {
    fetchPayouts();
  }, [currentPage, filters]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayouts({page: currentPage, limit, filters});
      setPayouts(data?.payouts || []);
      setTotalPages(data?.pagination?.pages);
      setTotalPayouts(data?.pagination?.total);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
      setPayouts([]);
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
  const handleActionClick = (action: 'approve' | 'reject' | 'hold' | 'process' | 'view_details', payout: AdminPayout) => {
    setOpenMenuId(null); // Close menu
    setActionReason(''); // Reset reason
    setActiveAction({ type: action, payout });
  };

  const handleModalConfirm = async () => {
    if (!activeAction.payout || !activeAction.type) return;
    
    if (activeAction.type === 'view_details') {
       setActiveAction({ type: null, payout: null });
       return;
    }

    setActionLoading(true);
    try {
        const payoutId = activeAction.payout.payoutId;
        
        switch (activeAction.type) {
            case 'approve':
                await adminService.approvePayout(payoutId, actionReason);
                break;
            case 'reject':
                await adminService.rejectPayout(payoutId, actionReason);
                break;
            case 'hold':
                await adminService.holdPayout(payoutId, actionReason);
                break;
            case 'process':
                await adminService.processPayout(payoutId);
                break;
        }
      
      setActiveAction({ type: null, payout: null });
      fetchPayouts();
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

  const getActionModalProps = () => {
      switch (activeAction.type) {
          case 'approve':
              return {
                  title: 'Approve Payout',
                  description: `Are you sure you want to approve payout #${activeAction.payout?.payoutNumber}? This will mark it as ready for processing.`,
                  confirmText: 'Approve Payout',
                  intent: 'primary' as const,
                  showReason: true,
                  reasonLabel: 'Approval Notes (Optional)',
                  reasonRequired: false
              };
          case 'reject':
              return {
                  title: 'Reject Payout',
                  description: `Are you sure you want to reject payout #${activeAction.payout?.payoutNumber}? The host will be notified.`,
                  confirmText: 'Reject Payout',
                  intent: 'danger' as const,
                  showReason: true,
                  reasonLabel: 'Rejection Reason',
                  reasonRequired: true
              };
          case 'hold':
              return {
                  title: 'Put Payout on Hold',
                  description: `Are you sure you want to put payout #${activeAction.payout?.payoutNumber} on hold?`,
                  confirmText: 'Confirm Hold',
                  intent: 'neutral' as const,
                  showReason: true,
                  reasonLabel: 'Reason for Hold',
                  reasonRequired: true
              };
           case 'process':
              return {
                  title: 'Process Payout',
                  description: `Are you sure you want to process payout #${activeAction.payout?.payoutNumber}? This indicates funds have been sent.`,
                  confirmText: 'Mark as Processed',
                  intent: 'primary' as const,
                  showReason: false,
                  reasonLabel: '',
                  reasonRequired: false
              };
          default:
              return {
                  title: 'Payout Details',
                  description: '',
                  confirmText: 'Close',
                  intent: 'neutral' as const,
                  showReason: false,
                  reasonLabel: '',
                  reasonRequired: false
              };
      }
  };

  const modalProps = getActionModalProps();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Payouts</h1>
            <p className="text-sm text-slate-500 font-[300]">Manage host payouts all from one place</p>
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
                  placeholder="Search by payout #, host, or event ..."
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
            <div className="bg-white overflow-x-auto overflow-y-auto rounded-[1.5rem] whitespace-nowrap overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Payout #</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Event</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Host</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest text-center">Amount</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 whitespace-nowrap text-[11px] font-[500] text-neutral-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : payouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                        No payouts found
                      </td>
                    </tr>
                  ) : (
                    payouts.map((payout) => (
                      <tr key={payout.payoutId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-[400] text-slate-700">{payout.payoutNumber}</span>
                        </td>
                        <td className="px-6 py-4" title={payout.eventTitle}>
                          <span className="text-xs font-[400] text-slate-700 max-w-[150px] truncate block">{payout.eventTitle}</span>
                        </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-xs font-[400] text-slate-700">{payout.hostName}</span>
                              <span className="text-[10px] text-slate-400">{payout.hostEmail}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-[400] text-slate-700"><BDTIcon /> {payout.amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payout.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-[400] text-slate-700">{new Date(payout.createdAt).toLocaleDateString()}</span>
                        </td>

                        <td className="px-6 py-4 text-right relative action-menu-container">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === payout.payoutId ? null : payout.payoutId)}
                            className="p-2 text-gray-400 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-50 relative"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {openMenuId === payout.payoutId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                              >
                                <div className="py-1">
                                  <button onClick={() => handleActionClick('view_details', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                    <FileText size={14} /> View Details
                                  </button>
                                  
                                  {/* PENDING ACTIONS */}
                                  {payout.status === 'pending' && (
                                    <>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button onClick={() => handleActionClick('approve', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                        <button onClick={() => handleActionClick('reject', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button onClick={() => handleActionClick('hold', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                            <RotateCcw size={14} /> Put on Hold
                                        </button>
                                    </>
                                  )}

                                  {/* APPROVED ACTIONS */}
                                  {payout.status === 'approved' && (
                                    <>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button onClick={() => handleActionClick('process', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                                            <CheckCircle size={14} /> Process
                                        </button>
                                        <button onClick={() => handleActionClick('reject', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button onClick={() => handleActionClick('hold', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                            <RotateCcw size={14} /> Put on Hold
                                        </button>
                                    </>
                                  )}

                                  {/* ON HOLD ACTIONS */}
                                  {payout.status === 'on_hold' && (
                                    <>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button onClick={() => handleActionClick('approve', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                        <button onClick={() => handleActionClick('reject', payout)} className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                            <XCircle size={14} /> Reject
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
                  {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalPayouts)} of {totalPayouts} payouts
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

      {/* Action Modals - Generic Payout Action Modal */}
      {(activeAction.type && activeAction.type !== 'view_details') && (
        <ActionModal
          isOpen={true}
          onClose={() => setActiveAction({ type: null, payout: null })}
          onConfirm={handleModalConfirm}
          title={modalProps.title}
          description={modalProps.description}
          type="custom"
          confirmText={modalProps.confirmText}
          intent={modalProps.intent}
          loading={actionLoading}
          disabled={modalProps.reasonRequired && !actionReason.trim()}
        >
             {modalProps.showReason && (
                 <div className="pt-2">
                     <label className="text-xs font-medium text-slate-500 mb-1.5 block">{modalProps.reasonLabel}</label>
                      <textarea
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder={`Start typing...`}
                        rows={3}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none placeholder:text-slate-400"
                      />
                 </div>
             )}
        </ActionModal>
      )}
      
       <ActionModal
        isOpen={activeAction.type === 'view_details'}
        onClose={() => setActiveAction({ type: null, payout: null })}
        onConfirm={() => setActiveAction({ type: null, payout: null })}
        title="Payout Details"
        description={`Details for payout #${activeAction.payout?.payoutNumber}. 
        Amount: ${activeAction.payout?.amount} ${activeAction.payout?.currency}.
        Bank: ${activeAction.payout?.bankName || 'N/A'}. 
        Account: ${activeAction.payout?.accountNumber || 'N/A'}.
        `}
        type="confirm"
        confirmText="Close"
        intent="neutral"
        loading={false}
      />

    </div>
  );
};
