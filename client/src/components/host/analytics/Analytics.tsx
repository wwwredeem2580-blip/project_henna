'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, ArrowUpRight, 
  Activity, Target, Loader2, AlertCircle
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, Area, AreaChart, BarChart, Bar
} from 'recharts';
import { useRouter } from 'next/navigation';
import { BDTIcon } from '@/components/ui/Icons';
import { apiClient } from '@/lib/api/client';
import Sidebar from '@/components/layout/Sidebar';

interface AnalyticsData {
  metrics: {
    overview: {
      totalRevenue: number;
      totalOrders: number;
      totalTicketsSold: number;
      upcomingEvents: number;
      currency: string;
      totalPayout: number;
    };
    revenueByPeriod: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
  revenueChart: {
    data: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    total: number;
    average: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsData, chartData] = await Promise.all([
        apiClient.get('/api/host/analytics/metrics'),
        apiClient.get(`/api/host/analytics/revenue-chart?period=${selectedPeriod}`)
      ]);

      setData({
        metrics: metricsData,
        revenueChart: chartData
      });
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/30">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/30">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-900 font-semibold mb-2">Failed to load analytics</p>
            <p className="text-slate-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!data?.metrics || !data?.revenueChart?.data) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/30">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">No analytics data available</p>
          </div>
        </main>
      </div>
    );
  }

  const { metrics, revenueChart } = data;
  const rawChartData = revenueChart.data || [];

  // Data Preparation
  const mainChartData = rawChartData.map((item: any) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const totalRevenue = metrics?.overview?.totalRevenue || 0;
  
  const revenueDistribution = rawChartData.map((item: any) => ({
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }), 
    fullDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
  }));

  // KPIs Calculation
  const totalOrders = metrics?.overview?.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const upcomingEvents = metrics?.overview?.upcomingEvents || 0;
  
  const conversionRate = upcomingEvents > 0 && totalOrders > 0
    ? Math.round((totalOrders / (upcomingEvents * 50)) * 100) 
    : 0; 
  
  const stats = [
    { 
      label: 'Total Revenue', 
      value: `BDT ${revenueChart.total?.toLocaleString() ?? 0}`, 
      icon: DollarSign, 
      trend: `${metrics.revenueByPeriod?.growth >= 0 ? '+' : ''}${metrics.revenueByPeriod?.growth?.toFixed(1) ?? 0}%`, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Average Daily', 
      value: `BDT ${revenueChart.average?.toFixed(0).toLocaleString() ?? 0}`, 
      icon: Activity, 
      trend: '+4.3%', 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      label: 'Avg Order Value', 
      value: `BDT ${avgOrderValue.toFixed(0).toLocaleString()}`, 
      icon: DollarSign, 
      trend: '+12.5%', 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Peak Revenue', 
      value: `BDT ${(Math.max(...rawChartData.map((d: any) => d.revenue)) || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      trend: '+18.2%', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Growth Rate', 
      value: `${metrics.revenueByPeriod?.growth?.toFixed(1) ?? 0}%`, 
      icon: TrendingUp, 
      trend: '+2.1%', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      label: 'Conversion Rate', 
      value: `${conversionRate}%`, 
      icon: Target, 
      trend: '+2.1%', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ];

  const periods = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '365d' }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/30">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 pb-32">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 lg:pt-12">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Analytics</h1>
              <p className="text-sm text-slate-500 font-[300]">Detailed insights into your revenue and performance</p>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    selectedPeriod === period.value
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-3xl shadow-[0_1px_4px_0px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className={`text-[7px] sm:text-[10px] font-bold px-2 py-1 rounded-full ${stat.bg} ${stat.color}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[7px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xs sm:text-base lg:text-lg font-semibold text-gray-800">{stat.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Revenue Trend Area Chart */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_1px_4px_0px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">Revenue Trend</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">Income over the selected period</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Revenue</div>
                    <div className="flex items-center gap-1 ml-3"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Orders</div>
                  </div>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mainChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} />
                      <Tooltip
                        cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs py-3 px-4 rounded-xl shadow-xl border border-white/10">
                                <p className="font-bold mb-2 text-slate-300">{label}</p>
                                <div className="space-y-1">
                                  <p className="text-indigo-300 flex items-center justify-between gap-4">
                                    <span>Revenue:</span> 
                                    <span className="font-mono font-bold flex items-center"><BDTIcon className="w-3 h-3"/>{payload[0]?.value?.toLocaleString()}</span>
                                  </p>
                                  <p className="text-emerald-300 flex items-center justify-between gap-4">
                                    <span>Orders:</span>
                                    <span className="font-mono font-bold">{payload[1]?.value}</span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="url(#colorRevenue)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Distribution Bar Chart */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_1px_4px_0px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">Revenue Distribution</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">Daily contribution to total revenue</p>
                  </div>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueDistribution} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(val) => `${val.toFixed(0)}%`} />
                      <Tooltip
                        cursor={{fill: '#f8fafc'}}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const dataItem = payload[0].payload;
                            return (
                              <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs py-2 px-3 rounded-lg shadow-xl">
                                <p className="font-bold mb-1 text-slate-300">{dataItem.fullDate}</p>
                                <p className="text-indigo-300 font-mono">
                                  {Number(payload[0].value).toFixed(1)}%
                                </p>
                                <p className="text-emerald-400 font-mono flex items-center">
                                  <BDTIcon className="w-3 h-3 mr-1"/>{dataItem.revenue.toLocaleString()}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="percentage" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Sidebar: Insights & Promo */}
            <div className="space-y-6">
              <div className="bg-white rounded-[24px] shadow-[0_1px_4px_0px_rgba(0,0,0,0.1)] p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target size={20} className="text-indigo-600" /> Optimized Insights
                </h3>
                <ul className="space-y-4">
                  {[
                    "Focus on high-converting events",
                    "Review pricing for low order value days",
                    "Promote during peak revenue hours"
                  ].map((insight, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 rounded-[24px] p-6 text-white overflow-hidden relative group">
                <div className="relative z-10">
                  <span className="inline-block px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold tracking-wider mb-4">COMING SOON</span>
                  <h3 className="text-xl font-bold mb-2">Optimization Masterclass</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">Learn how to maximize your event revenue with our upcoming host academy.</p>
                  <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                    Get Notified <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
