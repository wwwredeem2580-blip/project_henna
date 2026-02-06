
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket, DollarSign, ShoppingBag, Zap,
  Pause, Play, ChevronRight, Send, ExternalLink, LayoutGrid, MessageSquare, AlertTriangle, CheckCircle, FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';
import { formatRelativeTime } from '@/lib/utils';
import ActivityRow from '@/components/ui/ActivityRow';
import { eventsService } from '@/lib/api/events';
import { useNotification } from '@/lib/context/notification';
import { scannerService } from '@/lib/api/scanner';

interface EventOverviewProps {
  data: HostEventDetailsResponse | null;
  onUpdate?: (newData: HostEventDetailsResponse) => void;
  onRefetch?: () => Promise<void>;
}

export const EventOverview = ({ data, onUpdate, onRefetch }: EventOverviewProps) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isTogglingPause, setIsTogglingPause] = useState(false);

  const analytics = data?.analytics;
  const event = data?.event;

  // Tools & Exports State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const eventId = event?._id;
  const eventStartDate = event?.schedule?.startDate;

  const handleDownloadTicketSheet = async () => {
    if (!eventId || isGeneratingPDF) return;

    try {
      setIsGeneratingPDF(true);

      // Use scanner service instead of direct fetch
      const { blob, ticketCount } = await scannerService.downloadTicketSheet(eventId);

      // Download PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-sheet-${eventId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('success', 'Download Complete', `PDF with ${ticketCount} tickets downloaded`);
    } catch (error: any) {
      console.error('PDF generation error:', error);
      
      // Show specific error messages
      let errorMessage = 'Failed to generate PDF';
      if (error.message.includes('available 24 hours')) {
        errorMessage = 'Ticket sheet only available 24 hours before event';
      } else if (error.message.includes('No tickets')) {
        errorMessage = 'No tickets found for this event';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Generation timed out. Please try again.';
      }
      
      showNotification('error', 'Generation Failed', errorMessage + '. Contact support if issue persists.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };


  const stats = analytics ? [
    { label: 'Tickets Sold', value: analytics.totalTicketsSold.toLocaleString(), sub: `of ${analytics.capacity?.toLocaleString() || '0'}`, icon: Ticket },
    { label: 'Revenue', value: `${analytics.totalRevenue.toLocaleString()}`, sub: '+12% from target', icon: DollarSign, prefix: 'BDT' }, // Target is mock
    { label: 'Total Orders', value: analytics.totalOrders.toLocaleString(), sub: `Last: ${analytics.lastOrderDate ? formatRelativeTime(analytics.lastOrderDate) : 'N/A'}`, icon: ShoppingBag },
    { label: 'Sell-through', value: `${analytics.ticketsSoldPercentage}%`, sub: 'Trending high', icon: Zap },
  ] : [
    { label: 'Tickets Sold', value: '0', sub: 'of 0', icon: Ticket },
    { label: 'Revenue', value: 'BDT 0', sub: '0% from target', icon: DollarSign },
    { label: 'Total Orders', value: '0', sub: 'Last: N/A', icon: ShoppingBag },
    { label: 'Sell-through', value: '0%', sub: 'Trending high', icon: Zap },
  ];

  // Helper to check low inventory (mock logic: < 10 tickets remaining in any active tier)
  const lowInventoryTicket = event?.tickets.find(t => (t.quantity - t.sold) < 10 && (t.quantity - t.sold) > 0);
  const isSetupComplete = event?.status !== 'draft';

  const handleToggleSalesPause = async () => {
    if (!event?._id) return;

    setIsTogglingPause(true);
    try {
      const result = await eventsService.toggleSalesPause(event._id);
      showNotification('success', 'Sales Updated', result.message);

      // Refetch data from backend to ensure state is in sync
      if (onRefetch) {
        await onRefetch();
      }
    } catch (error: any) {
      console.error('Toggle sales pause error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to toggle sales pause';
      showNotification('error', 'Update Failed', errorMessage);
    } finally {
      setIsTogglingPause(false);
    }
  };

  const canToggleSales = event?.status === 'published' || event?.status === 'live';
  
  // Get sales paused status from the correct field (with fallback for backward compatibility)
  const salesPaused = event?.moderation?.sales?.paused ?? event?.salesPaused ?? false;

  const isWithin24Hours = eventStartDate 
    ? (new Date(eventStartDate).getTime() - new Date().getTime()) <= 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up mb-24">
    <div className="lg:col-span-2 space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 relative group overflow-hidden"
          >
            <div className="flex items-center gap-3 text-slate-400 mb-4 font-[500] text-[10px] uppercase tracking-widest">
              {stat.label}
            </div>
            <div className="text-xl font-[500] tracking-tight text-neutral-700"> 
              <span className="text-sm font-[400] text-slate-400">{stat.prefix} </span>
              {stat.value}
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          </motion.div>
        ))}
      </div>

      {/* Real-time Status */}
      <div className="bg-white p-4 rounded-[40px] soft-shadow relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-[400] tracking-wider text-gray-700">Event Status</h3>
            <span className={`flex items-center gap-1.5 font-[400] text-[10px] uppercase tracking-widest ${event?.status === 'live' ? 'text-emerald-600 animate-pulse' : 'text-amber-600'}`}>
              <div className={`w-2 h-2 rounded-full ${event?.status === 'live' ? 'bg-emerald-500' : 'bg-amber-500'}`} /> 
              {event?.status === 'live' ? 'Live & On Sale' : (event?.status || 'Draft')}
            </span>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-normal text-slate-500">Last ticket sold: <span className="text-slate-900 font-medium">{analytics?.lastOrderDate ? formatRelativeTime(analytics.lastOrderDate) : 'No sales yet'}</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleToggleSalesPause}
                disabled={!canToggleSales || isTogglingPause}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                  salesPaused
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                    : 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100'
                } ${!canToggleSales || isTogglingPause ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {salesPaused ? <Play size={18} strokeWidth={1} /> : <Pause size={18} strokeWidth={1} />}
                  <span className="text-xs font-[400] uppercase tracking-widest">
                    {isTogglingPause
                      ? 'Updating...'
                      : salesPaused
                        ? 'Resume Sales'
                        : 'Pause Sales'
                    }
                  </span>
                </div>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={handleDownloadTicketSheet}
                disabled={isGeneratingPDF || !isWithin24Hours}
                title={!isWithin24Hours ? "Available 24 hours before event starts" : "Download PDF ticket list"}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                  !isWithin24Hours 
                    ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} strokeWidth={1} />
                  <span className="text-xs font-[400] uppercase tracking-widest">
                    { !isWithin24Hours 
                        ? 'Available 24h before' 
                        : isGeneratingPDF 
                            ? 'Exporting...' 
                            : 'Export Tickets' 
                    }
                  </span>
                </div>
                {isWithin24Hours && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
              </button>

              <button className="flex items-center justify-between p-4 bg-brand-50 rounded-2xl border border-brand-100 text-brand-600 hover:bg-brand-100 transition-all group">
                <div className="flex items-center gap-3">
                  <Send size={18} strokeWidth={1} />
                  <div className='flex flex-col text-start'>
                    <span className="text-xs font-[400] uppercase tracking-widest">Email Updates</span>
                    <span className="text-xs font-[400] tracking-widest text-gray-400">coming soon</span>
                  </div>
                </div>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => window.open(`/events/${event?._id}`, '_blank')} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 hover:bg-slate-100 transition-all group">
                <div className="flex items-center gap-3">
                  <ExternalLink size={18} strokeWidth={1} />
                  <span className="text-xs font-[400] uppercase tracking-widest">Public View</span>
                </div>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[40px] soft-shadow">
        <h3 className="text-lg font-[400] text-gray-700 mb-8">Ticket Sales Status by Tier</h3>
        <div className="space-y-4">
          {data?.event.tickets.map((ticket) => {
             const sold = ticket.sold || 0;
             const total = ticket.quantity || 0;
             const pct = total > 0 ? Math.round((sold/total)*100) : 0;
             
             return (
              <div key={ticket._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`min-w-2 min-h-2 rounded-full ${pct > 80 ? 'bg-amber-400' : 'bg-brand-500'}`} />
                  <span className="text-xs font-[400] tracking-wider text-gray-700">{ticket.name} <span className="text-[10px] text-gray-400 font-normal">({ticket.tier})</span></span>
                </div>
                <span className="text-xs font-[400] tracking-wider text-gray-700">{sold} / {total} <span className="text-gray-400 font-bold ml-1">({pct}%)</span></span>
              </div>
             );
          })}
          {(!data?.event.tickets || data.event.tickets.length === 0) && (
              <p className="text-sm text-gray-400 italic">No tickets found.</p>
          )}
        </div>
      </div>
    </div>

    <div className="space-y-8">
      
      <div className="bg-white p-4 rounded-[40px] soft-shadow">
        <h3 className="text-lg font-[400] tracking-wider text-gray-700 mb-6">Recent Activity</h3>
        <div className="space-y-6">
          <ActivityRow label="Tickets Sold" value={analytics?.totalTicketsSold.toString() || '0'} icon={Ticket} color="text-emerald-500" />
          <ActivityRow label="Page Views" value={analytics?.views.toString() || '0'} icon={LayoutGrid} color="text-blue-500" />
          <ActivityRow label="Conversion Rate" value={`${analytics?.conversionRate || 0}%`} icon={Zap} color="text-amber-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-[40px] soft-shadow">
        <h3 className="text-lg font-[400] tracking-wider text-gray-700 mb-6">Alerts</h3>
        <div className="space-y-4">
          {lowInventoryTicket && (
            <div className="flex gap-4 items-start p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <AlertTriangle className="text-rose-600 flex-shrink-0" size={18} />
              <div>
                <p className="text-xs font-[400] text-rose-900 uppercase tracking-widest">Critical Alert</p>
                <p className="text-xs text-rose-700 font-normal mt-1">{lowInventoryTicket.name} selling fast ({lowInventoryTicket.quantity - lowInventoryTicket.sold} left)</p>
              </div>
            </div>
          )}
          {isSetupComplete && (
            <div className="flex gap-4 items-start p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <CheckCircle className="text-emerald-600 flex-shrink-0" size={18} />
              <div>
                <p className="text-xs font-[400] text-emerald-900 uppercase tracking-widest">Setup Complete</p>
                <p className="text-xs text-emerald-700 font-[300] mt-1">Event is configured and ready.</p>
              </div>
            </div>
          )}
          {!lowInventoryTicket && !isSetupComplete && (
             <p className="text-sm text-gray-400 italic">No active alerts.</p>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
