'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Wallet, 
  Calendar, 
  HelpCircle, 
  Loader2, 
  Mail, 
  User, 
  Building2, 
  CreditCard, 
  Clock, 
  CheckCircle,
  XCircle,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { useAuth } from "@/lib/context/auth";
import { adminService, AdminPayoutDetailsResponse, AdminPayoutOrder } from "@/lib/api/admin";
import Sidebar from "@/components/layout/Sidebar";
import { BDTIcon } from "@/components/ui/Icons";

export default function AdminPayoutDetails() {
  const params = useParams();
  const payoutId = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [payoutData, setPayoutData] = useState<AdminPayoutDetailsResponse['payout'] | null>(null);
  const [orders, setOrders] = useState<AdminPayoutOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (payoutId) {
      fetchPayoutDetails();
    }
  }, [payoutId, page]);

  const fetchPayoutDetails = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayoutDetails(payoutId, page, limit);
      setPayoutData(data.payout);
      setOrders(data.payout.orders || []);
      setTotalPages(data.payout.pagination?.pages || 1);
      setTotalOrders(data.payout.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to fetch payout details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        processing: 'bg-blue-50 text-blue-700 border-blue-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        completed: 'bg-slate-100 text-slate-700 border-slate-200',
        failed: 'bg-rose-50 text-rose-700 border-rose-200',
        on_hold: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    return (
      <span className={`px-2 py-1 text-[10px] font-medium rounded-md border ${styles[status] || styles.pending} uppercase tracking-wider`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 bg-white min-h-screen">
        
        {/* Navigation & Header */}
        <div className="mb-8">
            <button 
                onClick={() => router.back()} 
                className="text-sm mb-4 font-[300] text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1 group"
            >
                <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
                Back to Payouts
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-[400] text-slate-900 flex items-center gap-3">
                        Payout Details 
                        {payoutData && <span className="text-base text-slate-400 font-[300]">#{payoutData.payoutNumber}</span>}
                    </h1>
                </div>
                 {payoutData && (
                    <div className="flex items-center gap-3">
                        {getStatusBadge(payoutData.status)}
                        <span className="text-xs text-slate-500 font-[300] flex items-center gap-1">
                            <Clock size={14} /> 
                            {new Date(payoutData.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                 )}
            </div>
        </div>

        {loading && !payoutData ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
            <p className="text-slate-500 font-[300]">Loading payout details...</p>
          </div>
        ) : !payoutData ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-100 shadow-sm">
             <div className="text-center">
                <p className="text-slate-500 mb-2">Payout not found</p>
                <button onClick={() => router.push('/admin/payouts')} className="text-brand-600 hover:underline">Go back to list</button>
             </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Financial Overview */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    
                    <div className="flex items-center gap-3 text-slate-400 mb-4 font-[500] text-[10px] uppercase tracking-widest relative z-10">
                        <CreditCard size={14} /> 
                        Payout Amount
                    </div>
                    
                    <div className="relative z-10">
                        <div className="text-lg font-[500] tracking-tight text-neutral-700 flex items-center gap-1.5 mb-1"> 
                             <span className="text-xs font-[400] text-slate-400">{payoutData.currency}</span>
                             {payoutData.amount.toLocaleString()}
                        </div>
                         <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-slate-400 font-[400] uppercase tracking-wider">Status:</span>
                            <span className={`text-xs font-medium ${payoutData.status === 'approved' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                {payoutData.status.charAt(0).toUpperCase() + payoutData.status.slice(1).replace('_', ' ')}
                            </span>
                         </div>
                    </div>
                </motion.div>

                {/* 2. Host Info */}
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                    <div className="flex items-center gap-3 text-slate-400 mb-4 font-[500] text-[10px] uppercase tracking-widest relative z-10">
                        <User size={14} /> 
                        Host Information
                    </div>
                    
                    <div className="flex items-start gap-3 relative z-10">
                         <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-500 shadow-sm">
                             <span className="text-sm font-semibold">{payoutData.hostName.charAt(0)}</span>
                         </div>
                         <div>
                             <p className="text-sm font-[500] text-slate-900">{payoutData.hostName}</p>
                             <p className="text-xs text-slate-500 font-[300] flex items-center gap-1 mt-0.5">
                                 {payoutData.hostEmail}
                             </p>
                             <button onClick={() => window.open(`/profile/host/${payoutData.hostId._id}`, '_blank')} className="text-[10px] text-brand-600 hover:underline mt-1.5 font-medium">View Profile</button>
                         </div>
                    </div>
                </motion.div>

                {/* 3. Bank Details */}
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                    <div className="flex items-center gap-3 text-slate-400 mb-4 font-[500] text-[10px] uppercase tracking-widest relative z-10">
                        <Building2 size={14} /> 
                        Payment Details
                    </div>
                    
                    <div className="space-y-1 relative z-10">
                         <div className="flex flex-col">
                             <span className="text-[10px] text-slate-400 font-[400] uppercase tracking-wider mb-0.5">Method</span>
                             <span className="text-sm font-[500] text-slate-700 capitalize">{payoutData.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                         </div>
                         <div className="flex flex-col pt-2">
                             <span className="text-[10px] text-slate-400 font-[400] uppercase tracking-wider mb-0.5">{payoutData.paymentMethod === 'bkash' ? 'Number' : 'Account'}</span>
                             <span className="text-sm font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-100 inline-block w-fit">{payoutData.accountNumber || 'N/A'}</span>
                         </div>
                    </div>
                </motion.div>
            </div>

            {/* Orders Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-[400] text-slate-900">Included Orders</h2>
                        <p className="text-sm text-slate-500 font-[300]">List of orders included in this payout calculation</p>
                    </div>
                    <div className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-xs text-slate-600">
                        {totalOrders} Total Orders
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Order #</th>
                                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Buyer</th>
                                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest text-center">Tickets</th>
                                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[11px] font-[500] text-neutral-400 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 font-[300]">
                                        No orders found for this payout.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-[400] text-slate-900 font-mono">{order.orderNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-[400] text-slate-600">{new Date(order.createdAt).toLocaleDateString()} <span className="text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-[400] text-slate-600">{order.buyerEmail}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-[400] text-slate-600">{order.ticketCount}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className={`px-2 py-0.5 text-[10px] rounded-full border ${
                                                order.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                order.status === 'refunded' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-slate-50 text-slate-600 border-slate-100'
                                             }`}>
                                                {order.status}
                                             </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-[400] text-slate-900"><BDTIcon className="w-3 h-3 inline mr-0.5" />{order.amount}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                     <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/30">
                        <div className="text-xs text-slate-500 font-[300]">
                             Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalOrders)} of {totalOrders} orders
                        </div>
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-500"
                             >
                                <ChevronLeft size={16} />
                             </button>
                             <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show pages around current page
                                    let pNum = page - 2 + i;
                                    if (page < 3) pNum = 1 + i;
                                    if (page > totalPages - 2) pNum = totalPages - 4 + i;
                                    if (pNum < 1 || pNum > totalPages) return null;
                                    
                                    return (
                                        <button 
                                            key={pNum}
                                            onClick={() => setPage(pNum)}
                                            className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                                                page === pNum 
                                                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20' 
                                                : 'text-slate-600 hover:bg-white hover:border hover:border-slate-200'
                                            }`}
                                        >
                                            {pNum}
                                        </button>
                                    );
                                })}
                             </div>
                             <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-500"
                             >
                                <ChevronRight size={16} />
                             </button>
                        </div>
                     </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
