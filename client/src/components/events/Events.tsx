'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { publicService } from "@/lib/api/public";
import { Logo } from "../shared/Logo";
import { Search, X, ChevronDown, User, Wallet, Clock, Clock10, LogIn, UserPlus, Plus } from "lucide-react";

interface EventFilters {
  category?: string;
  location?: string;
  date?: string;
  search?: string;
}

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from "@/lib/context/auth";
import { BDTIcon } from "../ui/Icons";
import Sidebar from "../layout/Sidebar";

export default function Events() {
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<any[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const router = useRouter();
  const { user } = useAuth();



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

  const categoryOptions = [
    { value: 'concert', label: 'Concert' },
    { value: 'sports', label: 'Sports' },
    { value: 'conference', label: 'Conference' },
    { value: 'festival', label: 'Festival' },
    { value: 'theater', label: 'Theater' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'networking', label: 'Networking' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'other', label: 'Other' }
  ];

  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  // Fetch all locations, trending, and featured events initially
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all events for location extraction
        const allEventsData = await publicService.getEvents({ page: 1, limit: 1000 });
        if (allEventsData?.events) {
          const locations = [...new Set(allEventsData.events.map((event: any) => event.venue.address.city))].sort();
          setAllLocations(locations);
        }

        // Fetch trending events
        const trending = await publicService.getTrendingEvents(10);
        setTrendingEvents(trending);

        // Fetch featured events
        const featured = await publicService.getFeaturedEvents(10);
        setFeaturedEvents(featured);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch filtered events when filters change
  useEffect(() => {
    const fetchFilteredEvents = async () => {
      try {
        const params: any = { page: currentPage, limit: 100 };
        
        if (filters.category) params.category = filters.category;
        if (filters.location) params.location = filters.location;
        if (filters.search) params.search = filters.search;

        const eventsData = await publicService.getEvents(params);
        setEvents(eventsData?.events || []);
      } catch (err) {
        console.error("Failed to fetch filtered events", err);
      }
    };

    fetchFilteredEvents();
  }, [filters, currentPage]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 lg:p-8 ">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Explore Events</h1>
            <p className="text-sm text-slate-500 font-[300]">Browse all the events handpicked for you</p>
          </div>
          {user ? (
            <div className="hidden lg:flex items-center gap-3">
                {user?.role === 'host' && (
                  <>
                  <button onClick={() => router.push('/host/events/create')} title="Create Event" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Plus size={18}/></button>
                  <button onClick={() => router.push('/host/events')} title="My Events" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Calendar size={18}/></button>
                  <button onClick={() => router.push('/host/help')} title="Help" className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
                  </>
                )}
                {user?.role === 'user' && (
                  <>
                  <button onClick={() => router.push('/wallet')} title="Wallet" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Wallet size={18}/></button>
                  <button onClick={() => router.push('/help')} title="Help" className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
                  </>
                )}
                <div title={user?.email} className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
                <img onClick={() => {user?.role === 'host' ? router.push('/host/profile') : router.push('/wallet')}} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover cursor-pointer" />
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => router.push('/auth?tab=login')} title="Login" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><LogIn size={18}/></button>
              <button onClick={() => router.push('/onboarding')} title="Register" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><UserPlus size={18}/></button>
            </div>
          )}
        </header>
        <div className="rounded-[24px] mb-16">
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
              <div className="relative">
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="appearance-none bg-white border border-gray-100 text-neutral-600 text-xs sm:text-sm font-[300] py-1 sm:py-2 pl-4 pr-8 sm:pr-10 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/10"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <select
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="appearance-none bg-white border border-gray-100 text-gray-600 text-xs sm:text-sm font-normal py-1 sm:py-2 pl-4 pr-8 sm:pr-10 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="">All Locations</option>
                  {allLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
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
              if (key === 'category') {
                label = categoryOptions.find(opt => opt.value === value)?.label || value;
              } else if (key === 'location') {
                label = `Location: ${value}`;
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

        {/* Trending */}
        {trendingEvents.length > 0 && activeFilters.length === 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-[300] text-slate-900 tracking-tight">🔥 Trending</h2>
            <p className="text-xs text-slate-500 font-[300]">Events everybody's hooking up right now!</p>
          </div>

          <div className="grid pb-4 grid-flow-col auto-cols-[250px] gap-6 overflow-x-scroll scroll-smooth mb-10">
            {trendingEvents.length > 0 && trendingEvents.map((event: any, i: number) => {
              const minPrice = event.tickets?.length > 0 
                  ? Math.min(...event.tickets.map((t: any) => t.price?.amount))
                  : 0;
              const startDate = new Date(event.schedule?.startDate);
              const endDate = new Date(event.schedule?.endDate);
              const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
              const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => router.push(`/events/${event.slug || event._id}`)}
                  className="p-0 bg-slate-50 border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden cursor-pointer"
                >
                  <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                    <img
                      src={event.media?.coverImage?.url || 'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {event.status === 'live' && (
                      <div className="absolute top-4 gap-2 left-4 flex items-center ">
                        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                          <div className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full mr-2"></div>
                          Live
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 ml-[-12px] mb-2">
                      <div className="flex items-center gap-1 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                        🔥 Trending
                      </div>
                    </div>
                    <h2 className="text-lg font-[300] text-slate-900 tracking-tight truncate">{event.title}</h2>
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
                    </div>
                    {/* Price */}
                    <div className="flex justify-between items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500 font-[300]">
                        {event.venue?.address?.city || 'Location TBA'}
                      </span>
                      <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                        <span className="text-xs">From</span> <BDTIcon className="text-xs"/>{minPrice}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                </motion.div>
              );
            })}
          </div>
        </section>
        )}
        {/* Featured */}
        {featuredEvents.length > 0 && activeFilters.length === 0 && (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-1 text-lg font-[300] text-slate-900 tracking-tight"><Logo className="w-6 text-brand-500" /> Featured</h2>
                <p className="text-xs text-slate-500 font-[300]">Featured by Zenvy team</p>
              </div>
              <button className="text-[12px] font-[300] text-slate-400 hover:text-slate-900 transition-colors tracking-tight">See more</button>
            </div>

            <div className="grid pb-4 grid-flow-col auto-cols-[250px] gap-6 overflow-x-scroll scroll-smooth mb-10">
              {featuredEvents.length > 0 && featuredEvents.map((event: any, i: number) => {
                const minPrice = event.tickets?.length > 0 
                  ? Math.min(...event.tickets.map((t: any) => t.price?.amount))
                  : 0;
                const startDate = new Date(event.schedule?.startDate);
                const endDate = new Date(event.schedule?.endDate);
                const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => router.push(`/events/${event.slug || event._id}`)}
                    className="p-0 bg-slate-50 border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden cursor-pointer"
                  >
                    <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                      <img
                        src={event.media?.coverImage?.url || 'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {event.status === 'live' && (
                        <div className="absolute top-4 gap-2 left-4 flex items-center ">
                          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                            <div className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full mr-2"></div>
                            Live
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 ml-[-12px] mb-2">
                        <div className="flex items-center gap-1 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                          <Logo className="w-4 text-brand-500" /> Featured
                        </div>
                      </div>
                      <h2 className="text-lg font-[300] text-slate-900 tracking-tight truncate">{event.title}</h2>
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
                      </div>
                      {/* Price */}
                      <div className="flex justify-between items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500 font-[300]">
                          {event.venue?.address?.city || 'Location TBA'}
                        </span>
                        <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                          <span className="text-xs">From</span> <BDTIcon className="text-xs"/>{minPrice}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                  </motion.div>
                );
              })}
            </div>
          </section>
          )}

          {/* Events */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Explore</h2>
                <p className="text-xs text-slate-500 font-[300]">Choose what's best for you</p>
              </div>
              <button className="text-[12px] font-[300] text-slate-400 hover:text-slate-900 transition-colors tracking-tight">See more</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 mb-10">
              {events.length > 0 ? events.map((event: any, i: number) => {
                const minPrice = event.tickets?.length > 0 
                  ? Math.min(...event.tickets.map((t: any) => t.price?.amount))
                  : 0;
                const startDate = new Date(event.schedule?.startDate);
                const endDate = new Date(event.schedule?.endDate);
                const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => router.push(`/events/${event.slug || event._id}`)}
                    className="p-0 bg-slate-50 border rounded-br-lg rounded-tl-lg border-slate-100 relative group overflow-hidden cursor-pointer"
                  >
                    <div className="relative aspect-[2/1] overflow-hidden rounded-tl-lg">
                      <img
                        src={event.media?.coverImage?.url || 'https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {event.status === 'live' && (
                        <div className="absolute top-4 gap-2 left-4 flex items-center ">
                          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-[300] text-slate-900 border border-slate-100">
                            <div className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full mr-2"></div>
                            Live
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 ml-[-12px] mb-2">
                      </div>
                      <h2 className="text-lg font-[300] text-slate-900 tracking-tight truncate">{event.title}</h2>
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
                      </div>
                      {/* Price */}
                      <div className="flex justify-between items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500 font-[300]">
                          {event.venue?.address?.city || 'Location TBA'}
                        </span>
                        <span className="flex items-center gap-1 text-md text-slate-500 font-[300]">
                          <span className="text-xs">From</span> <BDTIcon className="text-xs"/>{minPrice}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                  </motion.div>
                );
              }) : (
                <div className="col-span-full text-center py-10 text-slate-400">
                  <p>No events found</p>
                </div>
              )}
            </div>
          </section>
      </main>
    </div>
  );
};
