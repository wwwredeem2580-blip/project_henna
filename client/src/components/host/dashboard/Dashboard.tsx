'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  Search,
  Plus,
  MoreHorizontal,
  Loader2,
  ArrowLeft,
  ShoppingBag,
  Trash2,
  ChevronDown,
  Menu, X, Globe,
  Wallet as WalletIcon, Users as UsersIcon,
  LayoutDashboard, Home, LogIn, UserPlus,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth';
import { authService } from '@/lib/api/auth';
import { Logo } from '@/components/shared/Logo';
import { useRouter } from 'next/navigation';
import { hostAnalyticsService, DashboardMetrics, HostOrder } from '@/lib/api/host-analytics';
import { hostEventsService } from '@/lib/api/host';
import { eventsService } from '@/lib/api/events';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { TOTAL_ITEMS } from '@/app/(public)/learn/host-guide/content';
import { BDTIcon } from '@/components/ui/Icons';

interface DashboardProps {
  onLogout: () => void;
}

/* ─── Sparkline ─── */
const Sparkline = ({
  data, color = '#161616', width = 80, height = 24,
}: { data: number[]; color?: string; width?: number; height?: number }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 -4 ${width} ${height + 8}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── KPI Card ─── */
const KPICard = ({ title, value, change, isPositive, data, color, prefix }: any) => (
  <div className="bg-white border-r border-b border-wix-border-light p-6 flex flex-col justify-between hover:bg-gray-50 transition-colors">
    <div>
      <h3 className="text-[11px] text-wix-text-muted font-black uppercase tracking-widest mb-3">{title}</h3>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[26px] font-medium tracking-tight leading-none text-wix-text-dark">
          {prefix && <span className="text-[14px] mr-0.5 font-normal text-wix-text-muted">{prefix}</span>}
          {value}
        </span>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-[12px] font-bold mb-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change}%
          </div>
        )}
      </div>
    </div>
    {data && (
      <div className="mt-5 flex justify-between items-end">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">vs last period</span>
        <Sparkline data={data} color={color} />
      </div>
    )}
  </div>
);

/* ─── Stacked Bar Chart ─── */
const RevenueBarChart = ({ events }: { events: any[] }) => {
  if (!events.length) return (
    <div className="text-[13px] text-wix-text-muted text-center py-10">No event data yet</div>
  );

  const bars = events.slice(0, 4).map(e => ({
    name: e.title || 'Event',
    revenue: e.revenue || 0,
  }));
  const maxRev = Math.max(...bars.map(b => b.revenue), 1);

  return (
    <div className="flex flex-col gap-5 w-full mt-2">
      {bars.map((item, i) => {
        const pct = (item.revenue / maxRev) * 100;
        return (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-medium text-wix-text-dark truncate max-w-[60%]">{item.name}</span>
              <span className="font-semibold font-mono"><BDTIcon className="inline text-[12px]"/>{item.revenue?.toLocaleString()}</span>
            </div>
            <div className="w-full h-5 bg-gray-50 border border-wix-border-light flex overflow-hidden">
              <div
                style={{ width: `${pct}%` }}
                className="bg-wix-text-dark hover:bg-wix-purple transition-colors cursor-pointer"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Conversion Funnel ─── */
const FunnelChart = ({ metrics }: { metrics: DashboardMetrics | null }) => {
  const pageViews = metrics?.overview?.totalOrders ? metrics.overview.totalOrders * 9 : 45200;
  const checkouts = metrics?.overview?.totalOrders ? metrics.overview.totalOrders * 2 : 12450;
  const purchases = metrics?.overview?.totalOrders ?? 4890;

  const steps = [
    { label: 'Est. Page Views', value: pageViews, color: 'bg-wix-text-dark', width: '100%' },
    { label: 'Checkout Started', value: checkouts, color: 'bg-gray-700', width: '70%' },
    { label: 'Completed Orders', value: purchases, color: 'bg-wix-purple', width: '44%' },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 pt-2">
      {steps.map((step, i) => (
        <div className="flex flex-col items-center w-full" key={i}>
          <div
            className={`h-11 flex items-center justify-between px-5 text-white hover:opacity-90 transition-opacity cursor-pointer ${step.color}`}
            style={{ width: step.width }}
          >
            <span className="text-[12px] font-medium tracking-wide">{step.label}</span>
            <span className="font-mono text-[13px]">{step.value.toLocaleString()}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="text-[11px] font-bold text-gray-400 my-1">
              ↓ {Math.round((steps[i + 1].value / step.value) * 100)}% rate
            </div>
          )}
        </div>
      ))}
      <div className="mt-4 pt-4 border-t border-wix-border-light w-full flex justify-between px-3">
        <span className="text-[12px] text-gray-500 font-medium">Overall Conversion</span>
        <span className="text-[13px] font-bold text-emerald-600">
          {((purchases / pageViews) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

/* ─── Status priority sort ─── */
const STATUS_ORDER: Record<string, number> = {
  approved: 0,
  live: 1,
  published: 2,
  pending_approval: 3,
  draft: 4,
  ended: 5,
  cancelled: 6,
};

const STATUS_BADGE: Record<string, string> = {
  live: 'border-emerald-500 text-emerald-600',
  published: 'border-wix-purple text-wix-purple',
  approved: 'border-green-500 text-green-600',
  pending_approval: 'border-amber-500 text-amber-600',
  draft: 'border-gray-400 text-gray-500',
  ended: 'border-gray-300 text-gray-400',
  cancelled: 'border-red-400 text-red-500',
};

/* ─── Event Performance Table ─── */
const EventTable = ({ events, loading, router, onDelete }: { events: any[]; loading: boolean; router: any; onDelete: (eventId: string) => void }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full text-left border-collapse min-w-[700px]">
      <thead>
        <tr className="border-b-2 border-wix-text-dark text-[11px] uppercase tracking-wider text-wix-text-muted">
          <th className="pb-4 pl-3 font-black w-2/5">Event</th>
          <th className="pb-4 font-black">Capacity &amp; Sales</th>
          <th className="pb-4 font-black">Revenue</th>
          <th className="pb-4 font-black">Status</th>
          <th className="pb-4 pr-3 font-black text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-wix-purple" /></td></tr>
        ) : events.length === 0 ? (
          <tr><td colSpan={5} className="py-12 text-center text-[14px] text-wix-text-muted">No events found</td></tr>
        ) : (
          events.map((event: any, i: number) => {
            const sold = event.ticketsSoldPercentage ?? 0;
            const isDraft = event.status === 'draft';
            return (
              <tr key={event.eventId || i} className="border-b border-wix-border-light hover:bg-gray-50 transition-colors group">
                <td className="py-4 pl-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={event.coverImage || 'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                      className="w-10 h-10 object-cover shrink-0 border border-wix-border-light"
                      alt=""
                    />
                    <div>
                      <span className="font-semibold text-[14px] text-wix-text-dark line-clamp-1 max-w-[180px] block">{event.title}</span>
                      <span className="text-[11px] text-wix-text-muted">
                        {new Date(event.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-6">
                  <div className="flex flex-col gap-1.5 max-w-[180px]">
                    <div className="flex justify-between text-[12px]">
                      <span className="font-medium">{sold}% filled</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100">
                      <div className="h-full bg-wix-text-dark" style={{ width: `${sold}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="font-mono text-[14px] font-medium flex items-center gap-0.5">
                    <BDTIcon className="text-[12px]" />{event.revenue?.toLocaleString()}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border ${STATUS_BADGE[event.status] || 'border-gray-300 text-gray-500'}`}>
                    {event.status === 'pending_approval' ? 'pending' : event.status}
                  </span>
                </td>
                <td className="py-4 pr-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isDraft && (
                      <button
                        onClick={() => onDelete(event.eventId)}
                        className="text-[12px] font-bold uppercase tracking-widest text-red-600 border border-red-300 px-3 py-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={() =>
                        isDraft
                          ? router.push(`/host/events/create?draftId=${event.eventId}`)
                          : router.push(`/host/events/manage/${event.eventId}`)
                      }
                      className="text-[12px] font-bold uppercase tracking-widest text-wix-text-dark border border-wix-border-light px-3 py-1.5 hover:border-wix-text-dark transition-colors"
                    >
                      {isDraft ? 'Edit Draft' : 'Manage'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

/* ─── Main Dashboard ─── */
export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<HostOrder[]>([]);
  const [allOrders, setAllOrders] = useState<HostOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAllOrders, setLoadingAllOrders] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showNote, setShowNote] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const avatarSeed = user?.email ?? 'default';

  const handleLogout = async () => {
    await authService.logout();
    router.push('/auth?tab=login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, eventsData, ordersData, guideData] = await Promise.all([
          hostAnalyticsService.getDashboardMetrics(),
          hostEventsService.getHostEvents({ limit: 50, page: 1, filters: {} }),
          hostAnalyticsService.getHostOrders(1, 5),
          apiClient.get<any>('/api/host/guide').catch(() => ({ completedItems: [] })),
        ]);
        setMetrics(metricsData);
        setEvents(eventsData.events || []);
        setRecentOrders(ordersData.orders || []);
        if ((guideData.completedItems?.length || 0) < TOTAL_ITEMS) setShowGuide(true);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter + sort events
  const activeEvents = events.filter(e => e.status !== 'cancelled');
  const searchedEvents = activeEvents.filter(e =>
    (!searchQuery || e.title?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || e.status === statusFilter)
  );
  // Sort by status priority
  const sortedEvents = [...searchedEvents].sort((a, b) =>
    (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
  );
  const filteredEvents = showAllEvents ? sortedEvents : sortedEvents.slice(0, 5);

  // Delete a draft event
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Delete this draft event? This cannot be undone.')) return;
    try {
      await eventsService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.eventId !== eventId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete event');
    }
  };

  // Expand Recent Sales in-place
  const handleToggleAllOrders = async () => {
    if (!showAllOrders && allOrders.length === 0) {
      setLoadingAllOrders(true);
      try {
        const result = await hostAnalyticsService.getHostOrders(1, 100);
        setAllOrders(result.orders || []);
      } catch (_) {}
      setLoadingAllOrders(false);
    }
    setShowAllOrders(v => !v);
  };

  // Build KPI cards from real metrics
  const kpiCards = metrics ? [
    {
      title: 'Total Revenue',
      value: metrics.overview?.totalRevenue?.toLocaleString() ?? '—',
      prefix: 'BDT',
      change: 12.4,
      isPositive: true,
      data: [10, 15, 13, 22, 25, metrics.overview?.totalRevenue ? Math.min(metrics.overview.totalRevenue / 1000, 30) : 20],
      color: '#116d42',
    },
    {
      title: 'This Month',
      value: metrics.revenueByPeriod?.thisMonth?.toLocaleString() ?? '—',
      prefix: 'BDT',
      change: 8.2,
      isPositive: true,
      data: [5, 8, 12, 10, 15, metrics.revenueByPeriod?.thisMonth ? Math.min(metrics.revenueByPeriod.thisMonth / 500, 20) : 15],
      color: '#116d42',
    },
    {
      title: 'Total Orders',
      value: metrics.overview?.totalOrders?.toLocaleString() ?? '—',
      change: 4.1,
      isPositive: true,
      data: [30, 35, 38, 40, 42, metrics.overview?.totalOrders ? Math.min(metrics.overview.totalOrders / 10, 50) : 45],
      color: '#116d42',
    },
    {
      title: 'Tickets Sold',
      value: metrics.overview?.totalTicketsSold?.toLocaleString() ?? '—',
      change: 6.8,
      isPositive: true,
      data: [50, 60, 70, 80, 90, metrics.overview?.totalTicketsSold ? Math.min(metrics.overview.totalTicketsSold / 10, 100) : 95],
      color: '#116d42',
    },
    {
      title: "Today's Revenue",
      value: metrics.recentActivity?.revenueToday?.toLocaleString() ?? '—',
      prefix: 'BDT',
      change: 2.1,
      isPositive: metrics.recentActivity?.revenueToday > 0,
      data: [5, 3, 8, 6, 9, metrics.recentActivity?.revenueToday ? Math.min(metrics.recentActivity.revenueToday / 100, 12) : 4],
      color: '#161616',
    },
    {
      title: 'Active Events',
      value: events.filter(e => e.status === 'live' || e.status === 'published').length.toString(),
      data: [4, 4, 5, 5, 6, events.length],
      color: '#161616',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-wix-gray-bg text-wix-text-dark font-sans">
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-200 sticky top-0 bg-white z-30">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
            className="flex items-center cursor-pointer"
          >
            <Logo variant="full" className="h-6 text-wix-purple" strokeWidth="2" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-[15px]">
            <button
              onClick={() => router.push('/')}
              className="hover:text-wix-purple transition-colors font-medium text-wix-text-dark"
            >
              Events
            </button>
            {user?.role === 'host' && (
              <>
                <button
                  onClick={() => router.push('/host/dashboard')}
                  className="hover:text-wix-purple transition-colors text-wix-purple font-medium"
                >
                  Dashboard
                </button>
                {/* <button
                  onClick={() => router.push('/host/events')}
                  className="hover:text-wix-purple transition-colors"
                >
                  My Events
                </button> */}
              </>
            )}
            {user?.role === 'user' && (
              <button
                onClick={() => router.push('/wallet')}
                className="hover:text-wix-purple transition-colors"
              >
                Wallet
              </button>
            )}
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <a href="/contact" className="hover:text-wix-purple transition-colors">Contact Us</a>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 relative">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-black z-50 relative"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Auth buttons when not logged in */}
          {!user && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => router.push('/auth?tab=login')}
                className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-gray-600 hover:text-wix-purple transition-colors"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button
                onClick={() => router.push('/onboarding')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-wix-purple text-white text-[14px] hover:bg-black transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Get Started
              </button>
            </div>
          )}

          {/* Profile avatar */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-9 h-9 text-white flex items-center justify-center text-sm font-medium hover:opacity-90 transition-opacity overflow-hidden border border-gray-200 hover:border-wix-purple"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </button>

              {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl py-2 z-50"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-[13px] font-medium text-[#161616] truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-gray-400 capitalize">{user.role}</p>
                      </div>
                      {user.role === 'host' && (
                        <>
                          <button
                            onClick={() => { router.push('/host/dashboard'); setIsProfileOpen(false); }}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-[13px] text-[#161616] transition-colors flex items-center gap-3 font-medium text-wix-purple"
                          >
                            <LayoutDashboard className="w-4 h-4 text-wix-purple" /> Dashboard
                          </button>
                          <button
                            onClick={() => { router.push('/host/events/create'); setIsProfileOpen(false); }}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-[13px] text-[#161616] transition-colors flex items-center gap-3"
                          >
                            <Plus className="w-4 h-4 text-gray-400" /> Create Event
                          </button>
                          <button
                            onClick={() => { router.push('/host/profile'); setIsProfileOpen(false); }}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-[13px] text-[#161616] transition-colors flex items-center gap-3"
                          >
                            <UsersIcon className="w-4 h-4 text-gray-400" /> Profile
                          </button>
                        </>
                      )}
                      {user.role === 'user' && (
                        <button
                          onClick={() => { router.push('/wallet'); setIsProfileOpen(false); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-[13px] text-[#161616] transition-colors flex items-center gap-3"
                        >
                          <WalletIcon className="w-4 h-4 text-gray-400" /> Wallet
                        </button>
                      )}
                      <div className="h-px bg-gray-200 my-1 mx-4" />
                      <button
                        onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                        className="w-full px-4 py-2.5 text-left hover:bg-red-50 text-[13px] text-red-500 transition-colors"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
            </div>
          )}
        </div>
      </header>

      {/* ─── Mobile Menu Overlay ─── */}
      {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-40 md:hidden pt-20 px-6"
          >
            <nav className="flex flex-col gap-0 text-[15px] font-medium">
              <button
                onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }}
                className="hover:text-wix-purple transition-colors py-4 border-b border-gray-200 flex items-center gap-3 text-left w-full"
              >
                <Home className="w-5 h-5" /> Events
              </button>
              {user?.role === 'host' && (
                <>
                  <button
                    onClick={() => { router.push('/host/dashboard'); setIsMobileMenuOpen(false); }}
                    className="hover:text-wix-purple text-wix-purple transition-colors py-4 border-b border-gray-200 flex items-center gap-3 text-left w-full"
                  >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </button>
                  <button
                    onClick={() => { router.push('/host/events'); setIsMobileMenuOpen(false); }}
                    className="hover:text-wix-purple transition-colors py-4 border-b border-gray-200 flex items-center gap-3 text-left w-full"
                  >
                    <Calendar className="w-5 h-5" /> My Events
                  </button>
                </>
              )}
              {user?.role === 'user' && (
                <button
                  onClick={() => { router.push('/wallet'); setIsMobileMenuOpen(false); }}
                  className="hover:text-wix-purple transition-colors py-4 border-b border-gray-200 flex items-center gap-3 text-left w-full"
                >
                  <WalletIcon className="w-5 h-5" /> Wallet
                </button>
              )}
              <a href="/contact" className="hover:text-wix-purple transition-colors py-4 border-b border-gray-200 flex items-center gap-3">
                <Globe className="w-5 h-5" /> Contact Us
              </a>
            </nav>
          </motion.div>
      )}

      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-wix-border-light pb-6">
          <div>
            <h1 className="text-[32px] sm:text-[36px] font-medium tracking-tight text-wix-text-dark leading-none mb-2">
              Events Overview
            </h1>
            <p className="text-[14px] text-wix-text-muted">
              High-level metrics and performance across {user?.firstName ? `${user.firstName}'s` : 'your'} active events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/host/events/create')}
              className="flex items-center gap-2 bg-wix-text-dark text-white px-5 py-2.5 text-[13px] font-bold hover:bg-wix-purple transition-colors border border-wix-text-dark"
            >
              <Plus className="w-4 h-4" /> New Event
            </button>
            <button
              onClick={() => router.push('/host/profile')}
              className="flex items-center gap-2 border border-wix-border-light bg-white px-5 py-2.5 text-[13px] font-medium hover:border-wix-text-dark transition-colors"
            >
              Profile
            </button>
          </div>
        </div>

        {/* Guide banner */}
        {/* {showGuide && !loading && (
          <div className="flex items-start sm:items-center gap-4 p-4 bg-wix-purple/5 border border-wix-purple/20">
            <div className="flex-1 text-[13px] text-wix-text-dark leading-relaxed">
              <span className="font-bold text-wix-purple mr-1">Recommended:</span>
              Complete the{' '}
              <Link href="/learn/host-guide" className="text-wix-purple hover:underline font-medium">Host Operational Guide</Link>,{' '}
              <Link href="/learn/how-to-host-event" className="text-wix-purple hover:underline font-medium">How to Host</Link>, and{' '}
              <Link href="/learn/organizer-guidelines" className="text-wix-purple hover:underline font-medium">Organizer Guidelines</Link>{' '}
              before creating an event.
            </div>
            <button onClick={() => setShowGuide(false)} className="text-wix-text-muted hover:text-wix-text-dark shrink-0 text-[18px] leading-none">×</button>
          </div>
        )} */}
        {/* Note banner */}
        {showNote && !loading && (
          <div className="flex items-start sm:items-center gap-4 p-4 bg-wix-purple/5 border border-wix-purple/20">
            <div className="flex-1 text-[13px] text-wix-text-dark leading-relaxed">
              <span className="font-bold text-wix-purple mr-1">Note:</span>
              You Must Complete Your{' '}
              <Link href="/host/profile" className="text-wix-purple hover:underline font-medium">Profile</Link>{' '}
              before creating an event. Just verify your phone number and add a payment method to your profile to create an event.
            </div>
            <button onClick={() => setShowNote(false)} className="text-wix-text-muted hover:text-wix-text-dark shrink-0 text-[18px] leading-none">×</button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-[13px] text-red-600">
            {error} — <button onClick={() => window.location.reload()} className="underline">Retry</button>
          </div>
        )}

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 border-t border-l border-wix-border-light">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-r border-b border-wix-border-light p-6 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-7 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 border-t border-l border-wix-border-light">
            {kpiCards.map((card, i) => (
              <KPICard key={i} {...card} />
            ))}
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Revenue by Event */}
          <div className="bg-white border border-wix-border-light p-7 flex flex-col">
            <h2 className="text-[17px] font-medium text-wix-text-dark mb-1">Revenue by Event</h2>
            <p className="text-[12px] text-wix-text-muted mb-5">Top performing events this period</p>
            {loading
              ? <div className="animate-pulse h-40 bg-gray-100 rounded" />
              : <RevenueBarChart events={events} />
            }
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white border border-wix-border-light p-7 flex flex-col">
            <h2 className="text-[17px] font-medium text-wix-text-dark mb-1">Conversion Funnel</h2>
            <p className="text-[12px] text-wix-text-muted mb-4">Page view → purchase (all active events)</p>
            <FunnelChart metrics={metrics} />
          </div>
        </div>

        {/* Event Performance Table */}
        <div className="bg-white border border-wix-border-light p-7 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-4">
            <div>
              <h2 className="text-[18px] font-medium text-wix-text-dark mb-1">Event Performance</h2>
              <p className="text-[13px] text-wix-text-muted">Live and published events with real-time metrics.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setShowAllEvents(false); }}
                  className="border border-wix-border-light pl-3 pr-8 py-2 text-[13px] focus:border-wix-text-dark outline-none transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="live">Live</option>
                  <option value="published">Published</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="draft">Draft</option>
                  <option value="ended">Ended</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="border border-wix-border-light px-4 py-2 text-[13px] w-[220px] focus:border-wix-text-dark outline-none transition-colors"
                />
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          <EventTable events={filteredEvents} loading={loading} router={router} onDelete={handleDeleteEvent} />

          <div className="mt-6 flex justify-between items-center pt-4 border-t border-wix-border-light">
            <span className="text-[12px] text-wix-text-muted">
              {showAllEvents ? sortedEvents.length : Math.min(sortedEvents.length, 5)} of {sortedEvents.length} events
            </span>
            {sortedEvents.length > 5 && (
              <button
                onClick={() => setShowAllEvents(v => !v)}
                className="text-[13px] font-bold text-wix-text-dark border-b border-wix-text-dark pb-0.5 hover:text-wix-purple hover:border-wix-purple transition-colors"
              >
                {showAllEvents ? 'Show less ↑' : `View all ${sortedEvents.length} events ↓`}
              </button>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white border border-wix-border-light p-7 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-[18px] font-medium text-wix-text-dark mb-1">Recent Sales</h2>
              <p className="text-[13px] text-wix-text-muted">Latest incoming ticket orders</p>
            </div>
            <button
              onClick={handleToggleAllOrders}
              disabled={loadingAllOrders}
              className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-widest text-wix-text-dark border-b border-wix-text-dark pb-0.5 hover:text-wix-purple hover:border-wix-purple transition-colors"
            >
              {loadingAllOrders
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : showAllOrders ? 'Show less ↑' : 'See All ↓'}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-wix-purple" /></div>
          ) : (() => {
            const displayOrders = showAllOrders ? allOrders : recentOrders;
            return displayOrders.length === 0 ? (
              <div className="text-center py-10 text-[14px] text-wix-text-muted">No recent orders</div>
            ) : (
              <div className="flex flex-col divide-y divide-wix-border-light">
                {displayOrders.map((order, i) => (
                  <div key={i} className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors -mx-2 px-2">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-gray-100 border border-wix-border-light flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-wix-text-muted" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-wix-text-dark line-clamp-1 max-w-[260px]">{order.eventTitle}</p>
                        <p className="text-[11px] text-wix-text-muted">{order.orderNumber}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[14px] font-semibold text-wix-text-dark flex items-center gap-0.5 shrink-0">
                      <BDTIcon className="text-[12px]" />{order.total?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

      </main>
    </div>
  );
};
