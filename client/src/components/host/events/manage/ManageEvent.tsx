'use client';

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Calendar,
  HelpCircle,
  ChevronLeft,
  ArrowLeft,
  ChartBar,
  CheckIcon,
  Info,
  Ticket,
  Layout,
} from 'lucide-react';
import { useAuth } from "@/lib/context/auth";
import Sidebar from "@/components/layout/Sidebar";
import Tab from "@/components/ui/Tab";
import { hostAnalyticsService, HostEventDetailsResponse } from "@/lib/api/host-analytics";
import { EventOverview } from "./tabs/EventOverview";
import { EventTicketsTab } from "./tabs/EventTicketsTab";
import { EventDetailsTab } from "./tabs/EventDetailsTab";
import { EventCheckInTab } from "./tabs/EventCheckInTab";
import { EventAnalyticsTab } from "./tabs/EventAnalyticsTab";
import { useNotification } from "@/lib/context/notification";


export default function ManageEvent() {
  const [data, setData] = useState<HostEventDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useParams();
  const { showNotification } = useNotification();

  // Fetch host event analytics/details
  const fetchEventData = async () => {
    try {
      setLoading(true);
      // Using the analytics service which returns the combined structure we designed
      const eventData = await hostAnalyticsService.getEventAnalytics(id as string);
      setData(eventData);
      
      // Redirect draft events to host events page
      if (eventData.event.status === 'draft') {
        showNotification('info', 'Event Not Submitted', 'Event management is only available after submitting your event for approval.');
        router.push('/host/events');
        return;
      }
    } catch (err: any) {
      console.error('Failed to fetch event:', err);
      setError(err.message || 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
        fetchEventData();
    }
  }, [id]);

  const handleUpdateData = (newData: HostEventDetailsResponse) => {
    setData(newData);
  };

  // Determine which tabs to show based on event status
  const getAvailableTabs = () => {
    const status = data?.event?.status;
    
    const allTabs = [
      {
        label: 'Overview',
        content: <EventOverview data={data} onUpdate={handleUpdateData} onRefetch={fetchEventData} />,
        icon: <Layout size={16} />,
      },
      {
        label: 'Tickets',
        content: <EventTicketsTab data={data} onUpdate={handleUpdateData} onRefetch={fetchEventData} />,
        icon: <Ticket size={16} />
      },
      {
        label: 'Details',
        content: <EventDetailsTab data={data} onUpdate={handleUpdateData} />,
        icon: <Info size={16} />
      },
      {
        label: 'Check-in',
        content: <EventCheckInTab data={data} />,
        icon: <CheckIcon size={16} />
      },
      {
        label: 'Analytics',
        content: <EventAnalyticsTab data={data} />,
        icon: <ChartBar size={16} />
      }
    ];

    // For pending_approval and approved: only show Tickets and Details
    if (status === 'pending_approval' || status === 'approved') {
      return allTabs.filter(tab => tab.label === 'Tickets' || tab.label === 'Details');
    }

    // For published, live, ended: show all tabs
    return allTabs;
  };

  const tabs = getAvailableTabs();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 lg:p-8 ">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => router.back()}
                className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
            >
                <ArrowLeft className="text-slate-400" size={24} />
            </button>
            <div>
                <h1 className="text-xl font-[400] tracking-normal text-neutral-800">Manage Event</h1>
                <p className="text-sm text-slate-500 font-[300]">{data?.event?.title || 'Loading...'}</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => router.push('/host/events')} title="Explore Events" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Calendar size={18}/></button>
              <button onClick={() => router.push('/host/help')} title="Help" className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
              <div title={user?.email} className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {loading ? (
            <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600 font-[300]">Loading event data...</p>
            </div>
            </div>
        ) : error ? (
            <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
                <p className="text-red-600 font-[400]">{error}</p>
                <button 
                onClick={() => window.location.reload()}
                className="text-sm text-brand-500 hover:underline"
                >
                Try Again
                </button>
            </div>
            </div>
        ) : (
            <Tab tabs={tabs} />
        )}

      </main>
    </div>
  );
};
