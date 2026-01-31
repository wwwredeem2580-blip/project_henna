'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ticketService, Ticket } from "@/lib/api/ticket";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Clock10,
  Edit,
  GitGraph,
  Globe,
  HelpCircle,
  Search,
  Trash,
  X,
} from 'lucide-react';
import { useAuth } from "@/lib/context/auth";

import Sidebar from "../../layout/Sidebar";
import { hostEventsService, HostEventsResponse } from "@/lib/api/host";
import { eventsService } from "@/lib/api/events";
import { useNotification } from '@/lib/context/notification';
import { motion } from "framer-motion";
import { BDTIcon } from "@/components/ui/Icons";

interface EventFilters {
  status?: string;
  search?: string;
}

export default function HostEvents() {
  const [hostEventsData, setHostEventsData] = useState<HostEventsResponse>();
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Fetch host events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        const hostEventsData = await hostEventsService.getHostEvents({
          page: currentPage,
          limit: 100,
          filters: filters
        });
        setHostEventsData(hostEventsData);
      } catch (err: any) {
        console.error('Failed to fetch events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage, filters]);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
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

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setLoading(true);
      await eventsService.deleteEvent(eventId);
      showNotification('success', 'Event deletion', 'Event deleted successfully');
    } catch (err: any) {
      showNotification('error', 'Event deletion', 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  }

  const handlePublishEvent = async (eventId: string) => {
    try {
      setLoading(true);
      await hostEventsService.publishEvent(eventId);
      showNotification('success', 'Event publish', 'Event published successfully');
    } catch (err: any) {
      showNotification('error', 'Event publish', 'Failed to publish event');
    } finally {
      setLoading(false);
    }
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-slate-500' },
    { value: 'pending_approval', label: 'Pending', color: 'bg-orange-500' },
    { value: 'approved', label: 'Approved', color: 'bg-green-500' },
    { value: 'published', label: 'Published', color: 'bg-brand-500' },
    { value: 'live', label: 'Live', color: 'bg-brand-500' },
    { value: 'ended', label: 'Ended', color: 'bg-rose-500' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100/50 text-red-500 border-red-200' },
  ];
  

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((option) => option.value === status);
    if (option) {
      return <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                <div className={`w-1.5 h-1.5 animate-pulse ${option.color} rounded-full mr-2`}></div>
                {option.label}
              </div>
    }
    return <span className="px-2 py-1 text-[10px] rounded-sm bg-slate-100 text-slate-500">Unknown</span>;
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 lg:p-8 ">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">My Events</h1>
            <p className="text-sm text-slate-500 font-[300]">Manage and track all your hosted events.</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => router.push('/events')} title="Explore Events" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Calendar size={18}/></button>
              <button onClick={() => router.push('/help')} title="Help" className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
              <div title={user?.email} className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="rounded-[24px] mb-0">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="flex-1 min-w-full md:min-w-[350px] flex gap-2">
                <input
                  type="text"
                  placeholder="Search by event name..."
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
              {/* Location Filter */}
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

        {/* Events */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
              {/* <div>
                <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Tickets</h2>
                <p className="text-xs text-slate-500 font-[300]">All your tickets are at one place</p>
              </div> */}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-600 font-[300]">Loading your events...</p>
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
            ) : hostEventsData?.events.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <p className="text-slate-600 font-[400]">No events found</p>
                  <button 
                    onClick={() => router.push('/host/events/create')}
                    className="text-sm text-brand-500 hover:underline"
                  >
                    Create Event
                  </button>
                </div>
              </div>
            ) : (
              // <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              //   {hostEventsData?.events.map((event) => {
              //     const eventDate = event?.startDate ? new Date(event.startDate) : 'TBD';
              //     const formattedDate = eventDate !== 'TBD' ? eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Event Date';
              //     const formattedTime = eventDate !== 'TBD' ? eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Event Time';
              //     const daysUntilEvent = eventDate !== 'TBD' ? Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 'TBD';
                  
              //     return (
              //       <div key={event.eventId}>
              //         <div
              //           className='max-w-[90vw] bg-brand-50 rounded-tr-2xl rounded-bl-2xl group cursor-pointer transition-all duration-300 p-4 gap-0 overflow-hidden relative select-none'
              //         >
              //           <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
              //             <img
              //               src={event.coverImage?.trim() || 'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
              //               alt={event.title}
              //               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              //             />
              //             {event.status === 'live' && (
              //               <div className="absolute top-4 gap-2 left-4 flex items-center ">
              //                 <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
              //                   <div className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full mr-2"></div>
              //                   Live
              //                 </div>
              //               </div>
              //             )}
              //           </div>

              //           <div className="px-6 py-4 w-full h-full flex flex-col gap-1 relative">
              //             <div className="text-md font-[400] line-clamp-2 tracking-wide text-neutral-700">
              //               {event.title || "Untitled Event"}
              //             </div>
              //             <div className="text-neutral-400 line-clamp-2 font-[500] text-[10px] uppercase tracking-widest">
              //               {event.venueName || "Unknown Venue"}
              //             </div>
              //             <div className="mt-2">
              //               <div className="text-neutral-400 font-[500] line-clamp-2 text-[10px] uppercase tracking-widest">
              //                 {formattedDate}
              //               </div>
              //               <div className="text-neutral-400 font-[500] line-clamp-2 text-[10px] uppercase tracking-widest">
              //                 {formattedTime}
              //               </div>
              //             </div>
              //             <span className="text-xs text-slate-500 line-clamp-1 font-[300]">
              //               {daysUntilEvent !== 'TBD' && daysUntilEvent > 0 ? `${daysUntilEvent} Days Left` : daysUntilEvent === 0 ? 'Today' : 'Event Passed'}
              //             </span>
              //             <div className="mt-2 flex flex-wrap items-center gap-2">
              //               {event.status === 'draft' && (
              //                 <button 
              //                   onClick={(e) => {
              //                     e.stopPropagation();
              //                     router.push(`/host/events/create?draftId=${event.eventId}`);
              //                   }}
              //                   className="border text-[10px] sm:text-xs font-[300] hover:scale-103 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              //                 >
              //                   <Edit size={12} strokeWidth={1}/> Edit
              //                 </button>
              //               )}
              //               <button 
              //                 onClick={(e) => {
              //                   e.stopPropagation();
              //                 }}
              //                 className="border text-[10px] sm:text-xs font-[300] hover:scale-103 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              //               >
              //                 <GitGraph size={12} strokeWidth={1}/> Manage
              //               </button>
              //               {event.status === 'draft' && (
              //                 <button 
              //                   onClick={(e) => {
              //                     e.stopPropagation();
              //                     handleDeleteEvent(event.eventId);
              //                   }}
              //                   className="border text-[10px] sm:text-xs font-[300] hover:text-rose-500 hover:scale-103 transition-all duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              //                 >
              //                   <Trash size={12} strokeWidth={1}/> Delete
              //                 </button>
              //               )}
              //               {event.status === 'approved' && event?.startDate > new Date().toISOString() && (
              //                 <button 
              //                   onClick={(e) => {
              //                     e.stopPropagation();
              //                     handlePublishEvent(event.eventId);
              //                   }}
              //                   className="border text-[10px] sm:text-xs font-[300] hover:text-brand-500 hover:scale-103 transition-all duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              //                 >
              //                   <Globe size={12} strokeWidth={1}/> Publish
              //                 </button>
              //               )}
              //             </div>
              //             <div className="absolute bottom-18 text-xs right-2 transition-transform pointer-events-none">
              //               {getStatusBadge(event.status)}
              //             </div>
              //           </div>
              //           <div className="absolute bottom-0 right-0 w-28 h-28 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              //         </div>
              //       </div>
              //     );
              //   })}
              // </div>
              <div className="grid p-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-10">
                {hostEventsData?.events?.map((event: any, i: number) => {
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);
                  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                  const daysUntilEvent = startDate ? Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 'TBD';
                  return (
                    <motion.div
                      key={event.eventId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-slate-50 border rounded-bl-lg rounded-tr-lg border-slate-100 relative group overflow-hidden cursor-pointer"
                    >
                      <div className="grid grid-cols-[1fr_minmax(14vw,14vw)] md:grid-cols-[1fr_minmax(7vw,7vw)] lg:grid-cols-[1fr_minmax(5vw,5vw)] xl:grid-cols-[1fr_minmax(6vw,6vw)] 2xl:grid-cols-[1fr_minmax(2vw,2vw)] gap-4">
                        {/* Main Image */}
                        <div className="relative aspect-[2/1] overflow-hidden rounded-tr-lg rounded-bl-lg">
                          <img
                            src={event?.coverImage || "https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60"}
                            alt={event?.media?.coverImage?.alt || "Event Cover Image"}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        {(
                          <div className="absolute top-4 gap-2 left-2 flex items-center ">
                            {getStatusBadge(event.status)}
                          </div>
                        )}

                        {/* Vertical Gallery */}
                        <div className="flex flex-col gap-2 overflow-hidden">
                          {(event?.media?.gallery || []).slice(0, 4).map((img: any, idx: number) => (
                            <div
                              key={idx}
                              className="aspect-[2/1] overflow-hidden rounded-tr-sm rounded-bl-sm"
                            >
                              <img
                                src={img?.url || `https://picsum.photos/id/${101 + idx}/200/120.jpg`}
                                alt={img?.caption || "Gallery image"}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-0">
                        <div className="flex items-center gap-2 ml-[-12px] mb-2">
                        </div>
                        <h2 className="text-[16px] font-[300] text-slate-900 tracking-tight truncate">{event.title}</h2>
                        <p className="text-xs text-slate-500 font-[300] line-clamp-2">{event.tagline || event.description}</p>
                        <div className="flex flex-col gap-2 mt-2 font-[400] text-neutral-700">
                          <span className="flex items-center gap-1 text-xs ">
                            <Calendar size={12} strokeWidth={1}/>
                            {formatDate(startDate)}
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <Clock10 size={12} strokeWidth={1}/>
                            {formatTime(startDate)} - {formatTime(endDate)}
                          </span>
                          {event.status === 'approved' && (daysUntilEvent as number < 7) ? (
                            <span className="text-xs text-slate-500 line-clamp-1 font-[300] flex items-center gap-1">
                              <AlertCircle className="text-red-500" size={12} strokeWidth={1}/> Less than {daysUntilEvent} days left to publish
                            </span>
                          ): (
                            <span className="text-xs text-slate-500 line-clamp-1 font-[300]">
                              {daysUntilEvent !== 'TBD' && daysUntilEvent > 0 ? `${daysUntilEvent} Days Left` : daysUntilEvent === 0 ? 'Today' : 'Event Passed'}
                            </span>
                          )}
                        </div>
                        {/* Price */}
                        {/* <div className="flex justify-between items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500 font-[300]">
                            {event.venueName || 'Location TBA'}
                          </span>
                          <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                            <span className="text-xs">From</span> <BDTIcon className="text-xs"/>{minPrice}
                          </span>
                        </div> */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {event.status === 'draft' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/host/events/create?draftId=${event.eventId}`);
                                }}
                                className="border text-[10px] sm:text-xs font-[300] hover:scale-103 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit size={12} strokeWidth={1}/> Edit
                              </button>
                            )}
                            {event.status !== 'draft' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/host/events/manage/${event.eventId}`);
                                }}
                                className="border text-[10px] sm:text-xs font-[300] hover:scale-103 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <GitGraph size={12} strokeWidth={1}/> Manage
                              </button>
                            )}
                            {event.status === 'draft' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.eventId);
                                }}
                                className="border text-[10px] sm:text-xs font-[300] hover:text-rose-500 hover:scale-103 transition-all duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash size={12} strokeWidth={1}/> Delete
                              </button>
                            )}
                            {event.status === 'approved' && event?.startDate > new Date().toISOString() && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublishEvent(event.eventId);
                                }}
                                className="border text-[10px] sm:text-xs font-[300] hover:text-brand-500 hover:scale-103 transition-all duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Globe size={12} strokeWidth={1}/> Publish
                              </button>
                            )}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
      </main>
    </div>
  );
};
