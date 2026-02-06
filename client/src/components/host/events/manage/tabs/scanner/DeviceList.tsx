
import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Plus, MoreVertical, Power, PowerOff, Trash2 } from 'lucide-react';
import { ScannerDevice } from '@/lib/api/scanner';

interface DeviceListProps {
  devices: ScannerDevice[];
  maxDevices: number;
  onAddDevice: () => void;
  onRefresh: () => void;
  onDisableDevice: (deviceId: string) => void;
  onEnableDevice: (deviceId: string) => void;
  onForceLogout: (deviceId: string) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({ 
  devices, 
  maxDevices,
  onAddDevice, 
  onDisableDevice,
  onEnableDevice,
  onForceLogout
}) => {
  const onlineCount = devices.filter(d => d.isOnline && d.status !== 'disabled').length;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="bg-white rounded-tr-[2rem] rounded-bl-[2rem] overflow-hidden h-full">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-md font-[500] text-slate-900 mb-1">Connected Devices</h3>
            <p className="text-slate-500 text-xs">{onlineCount} / {maxDevices} Devices Online</p>
          </div>
          <button 
            onClick={onAddDevice}
            className="flex items-center gap-2 px-2 py-2 bg-white border border-slate-200 text-slate-900 rounded-2xl font-semibold hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden text-[10px] sm:inline">Add Device</span>
          </button>
        </div>

        <div className="space-y-4">
          {devices.map((device) => {
             const isDisabled = device.status === 'disabled';
             return (
            <div key={device._id} className={`relative group flex items-center justify-between p-5 rounded-3xl border transition-all ${
                isDisabled ? 'border-slate-100 bg-slate-50 opacity-70' : 'border-slate-100 hover:border-[#683ee6]/30 hover:bg-[#efebff]/20'
            }`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    isDisabled ? 'bg-slate-200' :
                    device.isOnline ? 'bg-emerald-50' : 'bg-slate-100'
                }`}>
                  <Smartphone className={`w-5 h-5 ${
                      isDisabled ? 'text-slate-400' :
                      device.isOnline ? 'text-emerald-500' : 'text-slate-400'
                   }`} />
                </div>
                <div>
                  <h4 className="font-[500] text-slate-900 text-md flex items-center gap-2">
                    {device.deviceName}
                    {isDisabled && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Disabled</span>}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${
                        isDisabled ? 'bg-red-400' :
                        device.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}></span>
                    Last seen {formatTimeAgo(device.lastSeen)} • {device.totalScans} scans
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={(e) => toggleMenu(e, device._id)}
                  className="p-2 text-slate-300 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-6 h-6" />
                </button>

                {openMenuId === device._id && (
                  <div ref={menuRef} className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-10 py-1 overflow-hidden">
                    {isDisabled ? (
                         <button 
                            onClick={() => { onEnableDevice(device._id); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                        >
                            <Power className="w-4 h-4" /> Enable Device
                        </button>
                    ) : (
                         <button 
                            onClick={() => { onDisableDevice(device._id); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                        >
                            <PowerOff className="w-4 h-4" /> Disable Device
                        </button>
                    )}
                    <button 
                        onClick={() => { onForceLogout(device._id); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Force Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )})}

          {devices.length === 0 && (
            <div className="text-center py-2 border-2 border-dashed border-slate-200 rounded-tr-xl rounded-bl-xl">
              <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-900 text-xs font-[400]">No devices connected</p>
              <p className="text-slate-600 px-4 text-[10px] font-[300]">Scan the QR code on a mobile device to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
