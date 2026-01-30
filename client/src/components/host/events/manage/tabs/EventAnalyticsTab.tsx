import React from 'react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';

export const EventAnalyticsTab = ({ data }: { data: HostEventDetailsResponse | null }) => {
    const salesTrend = data?.analytics?.salesTrend || [];
    const chartData = salesTrend.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: d.revenue
    }));

    const ticketBreakdown = data?.analytics?.ticketBreakdown || [];
    const totalRevenue = data?.analytics?.totalRevenue || 0;

  return (
    <div className="space-y-8 animate-slide-up mb-48">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-lg font-[400] text-gray-800">Revenue Trend</h3>
            <p className="text-xs text-gray-400 font-[400] mt-1">Daily revenue generated</p>
          </div>
          {/* Filter is mockup for now as API fetches all/fixed range */}
          <select className="px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-[400] uppercase tracking-widest outline-none hover:scale-105 transition-all duration-200">
            <option>All Time</option>
          </select>
        </div>
        <div className="h-72 w-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide={false} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                        formatter={(value: any) => [`BDT ${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={4} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                    No sales data available yet.
                </div>
            )}
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-[40px] soft-shadow">
        <h3 className="text-md font-[400] text-gray-800 mb-6">Revenue by Ticket Type</h3>
        <div className="space-y-8">
          {ticketBreakdown.length > 0 ? ticketBreakdown.map((item, i) => {
            const pct = totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0;
            const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];
            const color = colors[i % colors.length];

            return (
                <div key={item.variantName} className="space-y-3">
                <div className="flex justify-between text-[10px] font-[300] uppercase tracking-widest">
                    <span className="text-gray-600 truncate max-w-[120px]">{item.variantName}</span>
                    <span className="text-gray-600">{pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
                </div>
            );
          }) : (
             <p className="text-sm text-gray-400 italic">No tickets sold yet.</p>
          )}
        </div>
      </div>
    </div>

    <div className="bg-white p-8 rounded-[40px] bg-slate-50">
       <h3 className="text-lg font-[400] text-gray-600 mb-6">Conversion Funnel</h3>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { label: 'Page Views', value: data?.analytics?.views?.toLocaleString() || '0', pct: '100%' },
            { 
                label: 'Orders', 
                value: data?.analytics?.totalOrders?.toLocaleString() || '0', 
                pct: `${data?.analytics?.views ? ((data.analytics.totalOrders / data.analytics.views) * 100).toFixed(1) : 0}%` 
            },
            { label: 'Conversion Rate', value: `${data?.analytics?.conversionRate || 0}%`, pct: 'Global' },
          ].map((step, i) => (
            <div key={i} className="relative group">
               <p className="text-[10px] font-[300] text-slate-400 uppercase tracking-[0.2em] mb-2">{step.label}</p>
               <div className="flex items-end gap-3">
                  <p className="text-xl font-[300] text-slate-600 leading-none">{step.value}</p>
                  <span className="text-[10px] font-[300] text-slate-300 mb-1">({step.pct})</span>
               </div>
            </div>
          ))}
       </div>
    </div>
  </div>
  );
};
