
import React from 'react';
import { ScanStats } from '@/lib/api/scanner';

interface ScannerOverviewProps {
  stats: ScanStats;
}

export const ScannerOverview: React.FC<ScannerOverviewProps> = ({ stats }) => {
  // Calculate circumference using radius 80 (2 * pi * 80 ≈ 502.7)
  const circumference = 502.7;
  const total = stats.total > 0 ? stats.total : 1;
  const successRate = stats.success / total;
  const dashOffset = circumference - (successRate * circumference);

  return (
    <div className="bg-white rounded-[1.5rem] h-full overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
        </div>
        <div className="text-right">
          {/* We could add logic for 'Last scan' time here if available in stats or separate prop */}
          {/* <p className="text-sm font-bold text-slate-900">Live</p> */}
        </div>
      </div>
      
      <div className="p-8 flex flex-col items-center justify-center gap-12 flex-1">
        {/* Donut Chart */}
        <div className="relative w-48 h-48 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="#efebff"
              strokeWidth="18"
              fill="transparent"
            />
            {/* Progress Circle (Success) */}
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="#683ee6"
              strokeWidth="18"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={stats.total === 0 ? circumference : dashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-[500] text-slate-900">{stats.total.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Scans</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4 min-w-[180px]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#683ee6]"></div>
            <div className="flex flex-col">
              <span className="text-sm font-[400] text-slate-900">Successful</span>
              <span className="text-xs text-slate-500">{stats.success} scans</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="flex flex-col">
              <span className="text-sm font-[400] text-slate-900">Duplicates</span>
              <span className="text-xs text-slate-500">{stats.duplicate} scans</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <div className="flex flex-col">
              <span className="text-sm font-[400] text-slate-900">Invalid</span>
              <span className="text-xs text-slate-500">{stats.invalid + stats.expired + (stats.cancelled || 0) + (stats.refunded || 0)} scans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
