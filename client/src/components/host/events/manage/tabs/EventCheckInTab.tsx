import React from 'react';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';

export const EventCheckInTab = ({ data }: { data: HostEventDetailsResponse | null }) => {
  const checkInStats = data?.analytics?.checkInStats;
  const metrics = data?.event?.metrics;

  const checkedIn = checkInStats?.checkedIn || metrics?.checkIns || 0;
  // If checkInStats.total is 0 or null, we might use total tickets sold as the potential pool
  const totalPotential = checkInStats?.total || data?.analytics?.totalTicketsSold || 0;
  const percentage = totalPotential > 0 ? Math.round((checkedIn / totalPotential) * 100) : 0;
  const remaining = totalPotential - checkedIn;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 animate-slide-up">
    <div className="lg:col-span-2 space-y-8">
      <div className="bg-white relative overflow-hidden">
        <div className="flex flex-col gap-10 mb-10 mt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className='h-10 w-1 bg-indigo-500'></div>
                <p className="text-4xl font-normal tracking-wider font-toroka text-gray-800">{checkedIn}</p>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Total Checked-in</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Tracking</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{percentage}% Attended</span>
              <span>{remaining} Remaining</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-2xl overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-xl transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-slate-50 rounded-[24px] flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Check-in</p>
            <p className="text-sm font-medium text-gray-700 tracking-wider">N/A <span className="text-slate-400 whitespace-nowrap text-xs font-normal ml-1">-</span></p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[24px] flex flex-col justify-center">
             {/* Mock data for flow since API doesn't provide it yet */}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Flow</p>
            <p className="text-sm font-medium text-gray-700 tracking-wider">-- <span className="text-slate-400 whitespace-nowrap text-xs font-normal ml-1">check-ins / hr</span></p>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-8">

      <div className="bg-white p-8 rounded-[38px] soft-shadow">
        <h4 className="text-md font-medium tracking-wider text-gray-700 mb-6">Live Logs</h4>
        <div className="space-y-4">
          {/* Mock logs placeholders as API doesn't return logs */}
          <div className="text-center py-6">
              <p className="text-xs text-slate-400">No recent activity logs available.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
