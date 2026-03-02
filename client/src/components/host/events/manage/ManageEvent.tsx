'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart2, Users, CheckCircle, Ticket,
  Image as ImageIcon, Megaphone, Settings,
  Calendar, MapPin, ArrowRight, Search, Filter,
  Download, Plus, X, Clock, Trash2, AlertTriangle,
  Mail, Tag, Link as LinkIcon, ArrowLeft, Loader2,
  Scan, Copy,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth';
import { hostAnalyticsService, HostEventDetailsResponse } from '@/lib/api/host-analytics';
import { useNotification } from '@/lib/context/notification';

/* ─── Shared UI ─── */
const SidebarItem = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3 text-[14px] font-medium transition-colors border-l-2 ${isActive ? 'border-black text-black bg-gray-50' : 'border-transparent text-wix-text-muted hover:text-black hover:bg-gray-50'}`}
  >
    <Icon className="w-4 h-4" />{label}
  </button>
);

const SharpToggle = ({ checked, onChange }: any) => (
  <div
    className={`w-10 h-6 relative cursor-pointer border ${checked ? 'bg-black border-black' : 'bg-gray-200 border-gray-300'} transition-colors`}
    onClick={() => onChange(!checked)}
  >
    <div className={`w-4 h-4 bg-white absolute top-0.5 border border-gray-300 transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-5' : 'left-0.5'}`} />
  </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-3 w-full p-4 border border-wix-border-light bg-white hover:border-black transition-colors text-left group">
    <Icon className="w-5 h-5 text-wix-text-muted group-hover:text-black transition-colors" />
    <span className="text-[14px] font-medium text-wix-text-dark">{label}</span>
    <ArrowRight className="ml-auto w-4 h-4 text-wix-text-muted opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
  </button>
);

/* ─── Tabs ─── */
const OverviewTab = ({ setActiveTab, data }: { setActiveTab: (t: string) => void; data: HostEventDetailsResponse | null }) => {
  const ev = data?.event;
  const an = data?.analytics;
  const soldPct = an?.ticketsSoldPercentage ?? 0;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-300">
      <div className="xl:col-span-2 flex flex-col gap-8">
        <div className="bg-white border border-wix-border-light p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-medium text-wix-text-dark">Event Overview</h2>
            <button onClick={() => setActiveTab('Settings')} className="text-[13px] text-gray-500 hover:text-black font-medium transition-colors border-b border-transparent hover:border-black">Edit</button>
          </div>
          <p className="text-[14px] text-wix-text-muted leading-relaxed mb-6">{ev?.tagline || ev?.description || 'No description provided.'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 text-[14px]">
            <div>
              <div className="text-[12px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Schedule</div>
              <div className="font-medium text-wix-text-dark">
                {ev?.schedule?.startDate ? new Date(ev.schedule.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                {ev?.schedule?.doors && <><br />{ev.schedule.doors}</>}
              </div>
            </div>
            <div>
              <div className="text-[12px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Location</div>
              <div className="font-medium text-wix-text-dark">
                {ev?.venue?.name || '—'}{ev?.venue?.address?.city && <><br />{ev.venue.address.city}, {ev.venue.address.country}</>}
              </div>
            </div>
            <div>
              <div className="text-[12px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Organizer</div>
              <div className="font-medium text-wix-text-dark">{ev?.organizer?.companyName || '—'}</div>
            </div>
            <div>
              <div className="text-[12px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Category</div>
              <div className="font-medium text-wix-text-dark capitalize">{ev?.category || '—'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-wix-border-light p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[18px] font-medium text-wix-text-dark">Ticket Sales Overview</h2>
            <button onClick={() => setActiveTab('Tickets')} className="text-[13px] text-black hover:text-gray-500 font-medium transition-colors border-b border-black hover:border-gray-500 pb-0.5">View Details</button>
          </div>
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="text-[32px] font-medium tracking-tight leading-none text-wix-text-dark">{an?.totalTicketsSold ?? 0}</div>
              <div className="text-[13px] text-gray-500 font-medium mt-1">Tickets Sold / {an?.capacity ?? 0} Capacity</div>
            </div>
            <div className="text-right">
              <div className="text-[20px] font-mono font-medium text-wix-text-dark">{an?.totalRevenue?.toLocaleString() ?? 0}</div>
              <div className="text-[13px] text-green-600 font-medium mt-1">Revenue (BDT)</div>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 border border-wix-border-light overflow-hidden mb-3">
            <div className="h-full bg-black transition-all duration-500" style={{ width: `${soldPct}%` }} />
          </div>
          <div className="flex justify-between text-[12px] text-gray-400 font-medium">
            <span>0</span><span>{soldPct}% Filled</span><span>{an?.capacity ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-[12px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Quick Actions</h2>
          <QuickActionButton icon={CheckCircle} label="Check-in Attendees" onClick={() => setActiveTab('Checkin')} />
          <QuickActionButton icon={Ticket} label="Manage Tickets" onClick={() => setActiveTab('Tickets')} />
          <QuickActionButton icon={ImageIcon} label="Upload Gallery Photos" onClick={() => setActiveTab('Gallery')} />
        </div>
        <div className="bg-white border border-wix-border-light p-6">
          <h2 className="text-[18px] font-medium text-wix-text-dark mb-6">Recent Activity</h2>
          <div className="flex flex-col">
            {an?.salesTrend?.slice(-2).map((s, i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-wix-border-light last:border-0">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center flex-shrink-0 text-[12px] font-bold">
                  {String(new Date(s.date).getDate()).padStart(2, '0')}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[14px] text-wix-text-dark"><span className="font-semibold">{s.orders} orders</span> · {s.revenue.toLocaleString()} BDT</div>
                  <div className="text-[11px] text-gray-400 font-medium">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
              </div>
            )) ?? (
              <p className="text-[13px] text-wix-text-muted">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendeesTab = ({ data }: { data: HostEventDetailsResponse | null }) => {
  const { id: eventId } = useParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!eventId) return;
      try {
        setOrdersLoading(true);
        const res = await hostAnalyticsService.getHostOrders(1, 100, { eventId: eventId as string });
        setOrders(res.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [eventId]);

  const filtered = orders.filter(o =>
    !search ||
    o.buyerEmail?.toLowerCase().includes(search.toLowerCase()) ||
    o.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );
  const displayed = showAll ? filtered : filtered.slice(0, 10);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-[20px] font-medium text-wix-text-dark">Attendee List</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or order..." className="w-full md:w-[250px] border border-wix-border-light pl-9 pr-4 py-2 text-[13px] outline-none focus:border-black transition-colors" />
          </div>
          <button className="border border-wix-border-light p-2 hover:border-black transition-colors bg-white"><Filter className="w-4 h-4" /></button>
          <button className="flex items-center gap-2 border border-wix-border-light px-4 py-2 text-[13px] font-medium hover:border-black transition-colors bg-white"><Download className="w-4 h-4" /> Export CSV</button>
        </div>
      </div>

      <div className="bg-white border border-wix-border-light overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-black text-[12px] uppercase tracking-wider text-gray-500 bg-gray-50">
              <th className="py-4 pl-6 font-semibold">Buyer</th>
              <th className="py-4 font-semibold">Tickets</th>
              <th className="py-4 font-semibold">Order #</th>
              <th className="py-4 font-semibold">Date</th>
              <th className="py-4 font-semibold">Total</th>
              <th className="py-4 font-semibold">Status</th>
              <th className="py-4 pr-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordersLoading ? (
              <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-wix-purple" /></td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-[14px] text-wix-text-muted">No orders for this event yet</td></tr>
            ) : displayed.map((o: any) => (
              <tr key={o.orderNumber} className="border-b border-wix-border-light hover:bg-gray-50 transition-colors group">
                <td className="py-4 pl-6">
                  <div className="font-semibold text-[14px]">{o.buyerEmail?.split('@')[0] || '—'}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{o.buyerEmail}</div>
                </td>
                <td className="py-4 text-[14px] font-medium">{o.ticketCount}</td>
                <td className="py-4 text-[14px] font-mono">#{o.orderNumber}</td>
                <td className="py-4 text-[14px] text-gray-500">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td className="py-4 text-[14px] font-mono">{o.total?.toLocaleString()} BDT</td>
                <td className="py-4">
                  <span className={`text-[11px] font-bold px-2 py-1 uppercase tracking-widest border ${
                    o.status === 'completed' || o.status === 'confirmed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : o.status === 'pending'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>{o.status}</span>
                </td>
                <td className="py-4 pr-6 text-right">
                  <button className="text-[13px] font-medium text-black border border-transparent px-3 py-1.5 hover:border-black transition-colors opacity-0 group-hover:opacity-100">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more / less footer */}
      {filtered.length > 10 && (
        <div className="flex justify-between items-center pt-4 border-t border-wix-border-light">
          <span className="text-[12px] text-wix-text-muted">
            {showAll ? filtered.length : Math.min(filtered.length, 10)} of {filtered.length} orders
          </span>
          <button
            onClick={() => setShowAll(v => !v)}
            className="text-[13px] font-bold text-wix-text-dark border-b border-wix-text-dark pb-0.5 hover:text-wix-purple hover:border-wix-purple transition-colors"
          >
            {showAll ? 'Show less ↑' : `View all ${filtered.length} orders ↓`}
          </button>
        </div>
      )}
    </div>
  );
};


const CheckinTab = ({ data }: { data: HostEventDetailsResponse | null }) => {
  const stats = data?.analytics?.checkInStats;
  const checkedIn = stats?.checkedIn ?? 0;
  const total = stats?.total ?? 0;
  const remaining = total - checkedIn;

  const [searchQuery, setSearchQuery] = useState('');
  const [scannerSessionActive, setScannerSessionActive] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devices, setDevices] = useState([
    { id: 1, name: 'iPhone 15 Pro - Staff 01', status: 'online', scans: 42 },
    { id: 2, name: 'iPad Air - Entrance A', status: 'offline', scans: 128 },
  ]);

  const copyLink = () => {
    navigator.clipboard.writeText('https://scanner.zenvy.com.bd?token=eyJhbGciOiJIUzI1NiIsInR...');
  };
  const toggleDevice = (id: number) => setDevices(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'online' ? 'offline' : 'online' } : d));

  const demoList = data?.event?.tickets?.map((t, i) => ({
    id: String(i), name: ['Alice Freeman', 'Bob Smith', 'Charlie Davis', 'Diana Prince', 'Evan Wright'][i % 5], ticket: t.name, checkedIn: i % 2 === 0,
  })) ?? [
    { id: '1', name: 'Alice Freeman', ticket: 'VIP Pass', checkedIn: true },
    { id: '2', name: 'Bob Smith', ticket: 'General Admission', checkedIn: false },
    { id: '3', name: 'Charlie Davis', ticket: 'Early Bird', checkedIn: false },
    { id: '4', name: 'Diana Prince', ticket: 'VIP Pass', checkedIn: true },
    { id: '5', name: 'Evan Wright', ticket: 'General Admission', checkedIn: false },
  ];
  const [attendees, setAttendees] = useState(demoList);
  const toggleCheckin = (id: string) => setAttendees(prev => prev.map(a => a.id === id ? { ...a, checkedIn: !a.checkedIn } : a));
  const filtered = attendees.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.ticket.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-black p-6 flex flex-col justify-center items-center text-center">
          <div className="text-[36px] font-bold leading-none mb-1">{checkedIn}</div>
          <div className="text-[13px] uppercase tracking-wider text-gray-500 font-semibold">Checked In</div>
        </div>
        <div className="bg-white border border-wix-border-light p-6 flex flex-col justify-center items-center text-center">
          <div className="text-[36px] font-bold leading-none mb-1">{remaining}</div>
          <div className="text-[13px] uppercase tracking-wider text-gray-500 font-semibold">Remaining</div>
        </div>
        <div className="bg-gray-50 border border-wix-border-light p-6 flex flex-col justify-center items-center text-center">
          <div className="text-[36px] font-bold leading-none mb-1">{total}</div>
          <div className="text-[13px] uppercase tracking-wider text-gray-500 font-semibold">Total Tickets</div>
        </div>
      </div>

      {/* Scanner Session */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[20px] font-bold text-black">Scanner Session Management</h2>

        {!scannerSessionActive ? (
          <div className="border border-black bg-white p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center border border-gray-300 mb-4">
              <Scan className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[18px] font-medium text-black mb-2">Scanner Session is Inactive</h3>
            <p className="text-[14px] text-wix-text-muted max-w-md mb-8">Activate a session to generate a shareable scanner link and authorize devices to scan tickets for this event.</p>
            <button onClick={() => setScannerSessionActive(true)} className="bg-black text-white px-8 py-4 text-[13px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Activate Session
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Active Session Link */}
            <div className="border border-black bg-white p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-green-600 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Active Session
                  </div>
                  <h3 className="text-[18px] font-medium text-black">Scanner Link</h3>
                  <p className="text-[13px] text-gray-500 mt-1">Share this link with your staff to open the scanner web-app.</p>
                </div>
                <button onClick={() => setScannerSessionActive(false)} className="border border-black px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 hover:border-red-600 transition-colors shrink-0">
                  Close Session
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input readOnly value="https://scanner.zenvy.com.bd?token=eyJhbGciOiJIUzI1NiIsInR..." className="flex-1 border border-black bg-gray-50 p-3 text-[14px] font-mono text-gray-600 outline-none select-all" />
                <button onClick={copyLink} className="bg-black text-white px-6 py-3 text-[13px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
            </div>

            {/* Connected Devices */}
            <div className="border border-black bg-white">
              <div className="p-6 border-b border-black flex justify-between items-center bg-gray-50">
                <h3 className="text-[16px] font-bold text-black">Connected Devices</h3>
                <button onClick={() => setShowOtpModal(true)} className="border border-black bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Device
                </button>
              </div>
              <div className="flex flex-col">
                {devices.map((device, idx) => (
                  <div key={device.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 ${idx !== devices.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="text-[14px] font-bold text-black">{device.name}</div>
                        <div className="text-[12px] text-gray-500 capitalize">{device.status}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                      <div className="text-right">
                        <div className="text-[18px] font-mono font-medium text-black">{device.scans}</div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Scans</div>
                      </div>
                      <button onClick={() => toggleDevice(device.id)} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest border transition-colors ${device.status === 'online' ? 'border-gray-300 text-gray-600 hover:bg-gray-100' : 'border-black text-black bg-white hover:bg-black hover:text-white'}`}>
                        {device.status === 'online' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-black p-8 max-w-[400px] w-full relative">
            <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-[20px] font-bold text-black text-center mb-2">Authorize Device</h3>
            <p className="text-[14px] text-gray-500 text-center mb-8 px-4">Enter this OTP on the scanner device to securely connect it to this session.</p>
            <div className="border border-black bg-gray-50 p-6 flex justify-center mb-8">
              <div className="text-[48px] font-mono font-bold tracking-[0.2em] text-black leading-none">842 915</div>
            </div>
            <div className="text-[12px] text-center text-gray-400 font-medium">OTP valid for 04:59</div>
          </div>
        </div>
      )}

      {/* Attendee List */}
      <div className="bg-white border border-wix-border-light p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-[18px] font-medium">Attendee Check-in</h3>
          <div className="relative w-full md:w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search by name or ticket..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full border border-wix-border-light pl-9 pr-4 py-2 text-[13px] outline-none focus:border-black transition-colors" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-[14px] text-gray-500 border border-dashed border-gray-300">No attendees found.</div>
          ) : filtered.map(a => (
            <div key={a.id} className="flex justify-between items-center p-4 border border-wix-border-light hover:border-black transition-colors">
              <div>
                <div className="font-semibold text-[14px] text-wix-text-dark">{a.name}</div>
                <div className="text-[12px] text-gray-500">{a.ticket}</div>
              </div>
              <div>
                {a.checkedIn ? (
                  <button onClick={() => toggleCheckin(a.id)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-[13px] font-bold tracking-widest uppercase hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-colors group">
                    <CheckCircle className="w-4 h-4 group-hover:hidden" /><X className="w-4 h-4 hidden group-hover:block" />
                    <span className="group-hover:hidden">Checked In</span><span className="hidden group-hover:block">Undo</span>
                  </button>
                ) : (
                  <button onClick={() => toggleCheckin(a.id)} className="px-6 py-2 bg-black text-white border border-black text-[13px] font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors">Check In</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TicketsTab = ({ setSidePanelOpen, data }: { setSidePanelOpen: (v: boolean) => void; data: HostEventDetailsResponse | null }) => {
  const tickets = data?.event?.tickets ?? [];
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-medium text-wix-text-dark">Tickets & Pricing</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage ticket tiers, capacity, and pricing rules.</p>
        </div>
        <button onClick={() => setSidePanelOpen(true)} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-[14px] font-medium hover:bg-gray-800 transition-colors border border-black">
          <Plus className="w-4 h-4" /> Create Ticket
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {tickets.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-wix-text-muted border border-dashed border-wix-border-light">No tickets created yet</div>
        ) : tickets.map((t, i) => {
          const pct = t.quantity > 0 ? Math.round((t.sold / t.quantity) * 100) : 0;
          const isSoldOut = t.sold >= t.quantity;
          return (
            <div key={i} className="bg-white border border-wix-border-light p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-black transition-colors cursor-pointer group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[16px] font-semibold text-wix-text-dark">{t.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${isSoldOut ? 'bg-gray-100 text-gray-500 border-gray-300' : t.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                    {isSoldOut ? 'Sold Out' : t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-[13px] text-gray-500">Capacity: {t.sold} / {t.quantity} sold</div>
              </div>
              <div className="flex-1 w-full max-w-[200px] hidden md:block">
                <div className="w-full h-1.5 bg-gray-100 border border-gray-200">
                  <div className={`h-full ${isSoldOut ? 'bg-gray-400' : 'bg-black'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="w-[120px] text-right">
                <div className="text-[18px] font-mono font-medium text-black">{t.price.amount.toLocaleString()} <span className="text-[13px] font-normal">{t.price.currency}</span></div>
              </div>
              <div className="w-[80px] text-right">
                <button className="text-[13px] text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity border-b border-black pb-0.5">Edit</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GalleryTab = ({ data }: { data: HostEventDetailsResponse | null }) => {
  const gallery = data?.event?.media?.gallery ?? [];
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-medium text-wix-text-dark">Event Gallery</h2>
          <p className="text-[13px] text-gray-500 mt-1">Upload and manage promotional and recap photos.</p>
        </div>
        <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-[14px] font-medium hover:bg-gray-800 transition-colors border border-black">
          <Plus className="w-4 h-4" /> Upload Media
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="aspect-square border-2 border-dashed border-wix-border-light bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors cursor-pointer group">
          <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[13px] font-medium">Click to Upload</span>
        </div>
        {gallery.map((img, i) => (
          <div key={i} className="aspect-square relative group border border-wix-border-light overflow-hidden">
            <img src={img.url} alt={img.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="p-3 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarketingTab = () => {
  const tools = [
    { icon: Mail, title: 'Email Campaigns', desc: 'Send announcements and reminders to your attendees list.', btn: 'Create Email' },
    { icon: Tag, title: 'Discount Codes', desc: 'Create promo codes to boost sales or reward loyal customers.', btn: 'New Promo Code' },
    { icon: LinkIcon, title: 'Tracking Links', desc: 'Generate unique links to see which channels drive the most sales.', btn: 'Create Link' },
  ];
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-[20px] font-medium text-wix-text-dark">Marketing Tools</h2>
        <p className="text-[13px] text-gray-500 mt-1">Boost attendance and track campaign performance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <div key={i} className="bg-white border border-wix-border-light p-6 flex flex-col justify-between hover:border-black transition-colors">
            <div>
              <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                <tool.icon className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-[16px] font-semibold text-wix-text-dark mb-2">{tool.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6">{tool.desc}</p>
            </div>
            <button className="w-full border border-black bg-white text-black py-2.5 text-[13px] font-semibold hover:bg-gray-50 transition-colors">{tool.btn}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const RestrictedTimePicker = ({ originalTime, label }: { originalTime: string; label: string }) => {
  const options = useMemo(() => {
    const [h] = originalTime.split(':').map(Number);
    const opts: { value: string; label: string }[] = [];
    for (let offset = -2; offset <= 2; offset++) {
      for (const mins of ['00', '30']) {
        const hour = h + offset;
        if (hour < 0 || hour > 23) continue;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const dh = hour % 12 || 12;
        opts.push({ value: `${String(hour).padStart(2, '0')}:${mins}`, label: `${dh}:${mins} ${ampm}` });
      }
    }
    return opts;
  }, [originalTime]);
  const [val, setVal] = useState(originalTime);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] uppercase tracking-wider text-gray-500 font-semibold flex justify-between">
        {label}<span className="text-gray-400 text-[10px] lowercase">(max ±2h)</span>
      </label>
      <div className="relative">
        <Clock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
        <select value={val} onChange={e => setVal(e.target.value)} className="w-full border border-wix-border-light pl-9 pr-4 py-2 text-[14px] outline-none focus:border-black transition-colors appearance-none bg-white cursor-pointer">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
};

const SettingsTab = ({ data }: { data: HostEventDetailsResponse | null }) => {
  const ev = data?.event;
  const [isPublic, setIsPublic] = useState(true);
  const [salesActive, setSalesActive] = useState(!(ev?.moderation?.sales?.paused));
  const [dates, setDates] = useState<string[]>(
    ev?.schedule?.startDate ? [ev.schedule.startDate.slice(0, 10)] : ['2026-10-15']
  );
  const removeDate = (d: string) => setDates(prev => prev.filter(x => x !== d));
  const addDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && !dates.includes(e.target.value)) setDates(prev => [...prev, e.target.value].sort());
  };
  const startTime = ev?.schedule?.doors || '09:00';

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 max-w-[1080px] pb-10">
      <div>
        <h2 className="text-[20px] font-medium text-wix-text-dark">Event Settings</h2>
        <p className="text-[13px] text-gray-500 mt-1">Manage configuration, scheduling, visibility, and sales rules.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white border border-wix-border-light p-8 flex flex-col gap-6">
            <h3 className="text-[14px] uppercase tracking-wider text-gray-800 font-semibold border-b border-wix-border-light pb-3">Event Details</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Event Description</label>
              <textarea rows={5} defaultValue={ev?.description || ''} className="w-full border border-wix-border-light p-4 text-[14px] focus:border-black outline-none transition-colors resize-y leading-relaxed" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Event Tagline</label>
              <input type="text" defaultValue={ev?.tagline || ''} className="w-full border border-wix-border-light p-3 text-[14px] focus:border-black outline-none transition-colors" />
            </div>
          </div>
          <div className="bg-white border border-wix-border-light p-8 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-black" />
            <div>
              <h3 className="text-[14px] uppercase tracking-wider text-gray-800 font-semibold">Event Schedule</h3>
              <p className="text-[12px] text-gray-500 mt-1">Multi-day configuration. Time edits restricted to ±2h from permit time.</p>
            </div>
            <div className="flex flex-col gap-3 pt-3 border-t border-wix-border-light">
              <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Selected Dates</label>
              <div className="flex flex-wrap gap-2">
                {dates.map(d => (
                  <div key={d} className="flex items-center border border-black bg-gray-50 text-[13px] font-mono">
                    <span className="px-3 py-1.5 border-r border-black">{d}</span>
                    <button onClick={() => removeDate(d)} className="p-1.5 hover:bg-black hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <input type="date" onChange={addDate} className="border border-dashed border-wix-border-light text-gray-500 px-3 py-1.5 text-[13px] font-mono hover:border-black cursor-pointer outline-none bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
              <RestrictedTimePicker label="Daily Start Time" originalTime={startTime} />
              <RestrictedTimePicker label="Daily End Time" originalTime="17:00" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-wix-border-light p-6 flex flex-col gap-6">
            <h3 className="text-[14px] uppercase tracking-wider text-gray-800 font-semibold border-b border-wix-border-light pb-3">Status Controls</h3>
            <div className="flex justify-between items-center group">
              <div>
                <div className="font-semibold text-[14px] text-wix-text-dark">Event Visibility</div>
                <div className="text-[12px] text-gray-500 mt-1">{isPublic ? 'Publicly visible' : 'Hidden / Private'}</div>
              </div>
              <SharpToggle checked={isPublic} onChange={setIsPublic} />
            </div>
            <div className="flex justify-between items-center group">
              <div>
                <div className="font-semibold text-[14px] text-wix-text-dark">Ticket Sales</div>
                <div className="text-[12px] text-gray-500 mt-1">{salesActive ? 'Active' : 'Paused'}</div>
              </div>
              <SharpToggle checked={salesActive} onChange={setSalesActive} />
            </div>
          </div>
          <div className="bg-white border border-wix-border-light p-6 flex flex-col gap-6">
            <h3 className="text-[14px] uppercase tracking-wider text-gray-800 font-semibold border-b border-wix-border-light pb-3">Financials</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Tax Rate (%)</label>
              <input type="number" defaultValue="0" className="border border-wix-border-light p-2.5 text-[14px] focus:border-black outline-none transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Currency</label>
              <select className="border border-wix-border-light p-2.5 text-[14px] focus:border-black outline-none transition-colors bg-white cursor-pointer appearance-none">
                <option>BDT (৳)</option><option>USD ($)</option><option>EUR (€)</option>
              </select>
            </div>
          </div>
          <button className="w-full bg-black text-white px-6 py-4 text-[13px] font-bold tracking-widest uppercase hover:bg-wix-purple transition-colors border border-black mt-2">Save All Settings</button>
          <div className="border border-red-600 bg-red-50 p-6 flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-[16px] font-semibold">Danger Zone</h3>
            </div>
            <p className="text-[12px] text-gray-700 leading-relaxed">Deleting an event is permanent and cannot be undone. All ticket sales will be stopped immediately.</p>
            <button className="bg-white text-red-600 border border-red-600 px-6 py-2.5 text-[13px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors w-full text-center">Delete Event</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Ticket Side Panel ─── */
const TicketSidePanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [limitPerOrder, setLimitPerOrder] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[450px] max-w-full h-full bg-white border-l border-black flex flex-col">
        <div className="px-6 py-5 border-b border-black flex justify-between items-center bg-gray-50">
          <h2 className="text-[18px] font-medium">Create New Ticket</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Ticket Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Early Bird" className="w-full border border-wix-border-light p-3 text-[14px] focus:border-black outline-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Price (BDT) <span className="text-red-500">*</span></label>
              <input type="number" placeholder="0" className="w-full border border-wix-border-light p-3 text-[14px] focus:border-black outline-none transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Capacity</label>
              <input type="number" placeholder="Unlimited" className="w-full border border-wix-border-light p-3 text-[14px] focus:border-black outline-none transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Description</label>
            <textarea rows={3} placeholder="Tell attendees what's included..." className="w-full border border-wix-border-light p-3 text-[14px] focus:border-black outline-none transition-colors resize-none" />
          </div>
          <div className="border-t border-wix-border-light pt-6 flex flex-col gap-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wider text-gray-800">Advanced Options</h3>
            <div className="border border-wix-border-light p-4 bg-gray-50 flex justify-between items-center">
              <div>
                <div className="font-semibold text-[14px] text-wix-text-dark">Ticket Visibility</div>
                <div className="text-[12px] text-wix-text-muted mt-1">Show on public event page</div>
              </div>
              <SharpToggle checked={isVisible} onChange={setIsVisible} />
            </div>
            <div className="border border-wix-border-light p-4 bg-gray-50 flex justify-between items-center">
              <div>
                <div className="font-semibold text-[14px] text-wix-text-dark">Limit Per Order</div>
                <div className="text-[12px] text-wix-text-muted mt-1">Restrict number of tickets per user</div>
              </div>
              <SharpToggle checked={limitPerOrder} onChange={setLimitPerOrder} />
            </div>
          </div>
        </div>
        <div className="border-t border-black p-6 shrink-0 flex gap-4 bg-white">
          <button onClick={onClose} className="flex-1 border border-black px-4 py-3 text-[13px] font-bold tracking-widest uppercase hover:bg-gray-100 transition-colors text-black">Cancel</button>
          <button onClick={onClose} className="flex-1 bg-black text-white px-4 py-3 text-[13px] font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors border border-black">Save Ticket</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Mobile Tab Strip ─── */
const MobileTabStrip = ({ activeKey, onSelect }: { activeKey: string; onSelect: (k: string) => void }) => {
  const tabs = [
    { key: 'Overview', icon: BarChart2 }, { key: 'Attendees', icon: Users },
    { key: 'Checkin', icon: CheckCircle, label: 'Check-in' }, { key: 'Tickets', icon: Ticket },
    { key: 'Gallery', icon: ImageIcon }, { key: 'Marketing', icon: Megaphone }, { key: 'Settings', icon: Settings },
  ];
  return (
    <div className="md:hidden flex overflow-x-auto bg-white border-b border-wix-border-light sticky top-0 z-20 px-4 py-3 gap-2">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onSelect(t.key)} className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium whitespace-nowrap border transition-colors ${activeKey === t.key ? 'bg-black text-white border-black' : 'bg-white text-wix-text-muted border-wix-border-light hover:border-black'}`}>
          <t.icon className="w-3.5 h-3.5" />{t.label || t.key}
        </button>
      ))}
    </div>
  );
};

/* ─── Main ─── */
export default function ManageEvent() {
  const [data, setData] = useState<HostEventDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState('Overview');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const router = useRouter();
  const { id } = useParams();
  const { showNotification } = useNotification();

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const d = await hostAnalyticsService.getEventAnalytics(id as string);
      setData(d);
      if (d.event.status === 'draft') {
        showNotification('info', 'Event Not Submitted', 'Event management is only available after submitting for approval.');
        router.push('/host/events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchEventData(); }, [id]);

  const ev = data?.event;
  const statusBadge = ev?.status ? (
    <span className={`text-[10px] font-black px-2.5 py-1 border uppercase tracking-widest ${
      ev.status === 'live' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' :
      ev.status === 'published' ? 'border-wix-purple text-wix-purple bg-wix-purple/5' :
      ev.status === 'pending_approval' ? 'border-amber-400 text-amber-600 bg-amber-50' :
      'border-gray-300 text-gray-500 bg-gray-50'
    }`}>{ev.status.replace('_', ' ')}</span>
  ) : null;

  const ALL_TABS = ['Overview', 'Attendees', 'Checkin', 'Tickets', 'Gallery', 'Marketing', 'Settings'];
  const RESTRICTED_TABS = ['Tickets', 'Settings'];
  const visibleTabs = useMemo(() => {
    const s = ev?.status;
    if (s === 'pending_approval' || s === 'approved') return RESTRICTED_TABS;
    return ALL_TABS;
  }, [ev?.status]);

  const sidebarTabs = [
    { key: 'Overview', icon: BarChart2, label: 'Overview' },
    { key: 'Attendees', icon: Users, label: 'Attendees' },
    { key: 'Checkin', icon: CheckCircle, label: 'Check-in' },
    { key: 'Tickets', icon: Ticket, label: 'Tickets & Pricing' },
    { key: 'Gallery', icon: ImageIcon, label: 'Gallery' },
    { key: 'Marketing', icon: Megaphone, label: 'Marketing' },
    { key: 'Settings', icon: Settings, label: 'Settings' },
  ].filter(t => visibleTabs.includes(t.key));

  return (
    <div className="min-h-screen bg-wix-gray-bg text-wix-text-dark font-sans flex flex-col">
      <MobileTabStrip activeKey={activeKey} onSelect={setActiveKey} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-[240px] shrink-0 border-r border-wix-border-light bg-white hidden md:flex flex-col py-6 min-h-screen">
          <div className="px-6 mb-2">
            <button onClick={() => router.push('/host/dashboard')} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-wix-text-muted hover:text-wix-text-dark transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-0.5">Managing Event</div>
            <div className="text-[13px] font-semibold text-wix-text-dark leading-tight truncate" title={ev?.title}>
              {loading ? '...' : (ev?.title || 'Event')}
            </div>
          </div>
          <nav className="mt-5 flex flex-col">
            {sidebarTabs.map(t => (
              <SidebarItem key={t.key} icon={t.icon} label={t.label} isActive={activeKey === t.key} onClick={() => setActiveKey(t.key)} />
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Header */}
          <div className="px-8 py-7 border-b border-wix-border-light bg-white">
            <div className="text-[12px] text-wix-text-muted font-medium flex items-center gap-2 mb-4">
              <span onClick={() => router.push('/host/dashboard')} className="hover:text-wix-text-dark cursor-pointer transition-colors">Dashboard</span>
              <span>/</span>
              <span onClick={() => router.push('/host/events')} className="hover:text-wix-text-dark cursor-pointer transition-colors">Events</span>
              <span>/</span>
              <span className="text-wix-text-dark">{loading ? '...' : (ev?.title || 'Event')}</span>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-[28px] font-medium tracking-tight text-wix-text-dark leading-none">{loading ? 'Loading...' : (ev?.title || 'Event')}</h1>
                  {statusBadge}
                </div>
                {(ev?.schedule?.startDate || ev?.venue?.name) && (
                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-wix-text-muted mt-3">
                    {ev?.schedule?.startDate && <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(ev.schedule.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                    {ev?.venue?.name && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{ev.venue.name}{ev.venue.address?.city ? `, ${ev.venue.address.city}` : ''}</div>}
                  </div>
                )}
              </div>
              {!loading && ev && (
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => router.push(`/events/${ev._id || id}`)} className="border border-wix-text-dark bg-white text-wix-text-dark px-5 py-2.5 text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">Preview</button>
                  {ev.status === 'published' && <button className="bg-wix-text-dark text-white px-5 py-2.5 text-[13px] font-bold uppercase tracking-widest hover:bg-wix-purple transition-colors border border-wix-text-dark hover:border-wix-purple">Publish Event</button>}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {loading ? (
              <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-wix-purple" /></div>
            ) : error ? (
              <div className="flex flex-col items-center py-24 gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <button onClick={fetchEventData} className="text-[13px] text-wix-purple hover:underline">Try Again</button>
              </div>
            ) : (
              <div key={activeKey}>
                {activeKey === 'Overview' && <OverviewTab setActiveTab={setActiveKey} data={data} />}
                {activeKey === 'Attendees' && <AttendeesTab data={data} />}
                {activeKey === 'Checkin' && <CheckinTab data={data} />}
                {activeKey === 'Tickets' && <TicketsTab setSidePanelOpen={setSidePanelOpen} data={data} />}
                {activeKey === 'Gallery' && <GalleryTab data={data} />}
                {activeKey === 'Marketing' && <MarketingTab />}
                {activeKey === 'Settings' && <SettingsTab data={data} />}
              </div>
            )}
          </div>
        </main>
      </div>

      <TicketSidePanel isOpen={sidePanelOpen} onClose={() => setSidePanelOpen(false)} />
    </div>
  );
}
