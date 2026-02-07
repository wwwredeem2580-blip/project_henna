import React from 'react';
import { ArrowRight, MousePointer2 } from 'lucide-react';
import Link from 'next/link';

export interface GuideItem {
  id: string;
  label: string;
  description?: string;
  isCritical?: boolean;
  expandedContent?: React.ReactNode;
}

export interface Phase {
  id: number;
  title: string;
  description: string;
  items: GuideItem[];
}

const ScannerSetupVisual = () => (
  <div className="mt-4 space-y-4">
     <div className="text-sm text-neutral-600 space-y-2">
        <p>Follow these steps to enable ticket scanning:</p>
        <ol className="list-decimal pl-5 space-y-1 text-neutral-700">
            <li>Go to your <Link href="/host/events" target="_blank" className="text-brand-600 hover:underline font-medium inline-flex items-center gap-1">Events Dashboard <ArrowRight size={12} /></Link>.</li>
            <li>Select <strong>Manage Event</strong> for your specific event.</li>
            <li>Navigate to the <strong>Scanner</strong> tab.</li>
            <li>Click <strong>Activate Scanner Session</strong> to generate the entry code.</li>
        </ol>
     </div>

     {/* Mock UI */}
     <div className="relative bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden max-w-[400px] select-none">
        {/* Browser Top Bar */}
        <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-200 flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <div className="mx-auto text-[10px] text-neutral-400 font-medium bg-white px-2 py-0.5 rounded border border-neutral-100 shadow-sm">
                zenvy.com/host/events/manage
            </div>
        </div>

        {/* Mock Content */}
        <div className="p-5 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-neutral-100 pb-2">
                <div className="w-12 h-2 bg-neutral-200 rounded-full"></div>
                <div className="w-16 h-2 bg-brand-100 rounded-full relative">
                    <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-brand-500"></div>
                </div>
                <div className="w-10 h-2 bg-neutral-200 rounded-full"></div>
            </div>

            {/* Scanner Area */}
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 flex flex-col items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>
                </div>
                <div>
                     <div className="w-32 h-2 bg-neutral-200 rounded mx-auto mb-1.5"></div>
                     <div className="w-20 h-2 bg-neutral-100 rounded mx-auto"></div>
                </div>
                
                <div className="relative">
                    <button className="mt-2 px-4 py-2 bg-brand-600 text-white text-xs font-medium rounded-lg shadow-sm shadow-brand-200 hover:bg-brand-700 transition-colors">
                        Activate Scanner
                    </button>
                    
                    {/* Cursor Pointer */}
                    <div className="absolute top-1/2 -right-12 -translate-y-1/2 flex items-center animate-pulse">
                         <div className="text-brand-600 flex items-center gap-1">
                            <span className="text-[10px] font-bold">Click Here</span>
                            <MousePointer2 size={16} className="-rotate-90 fill-brand-600" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
     </div>
  </div>
);

const AddDeviceVisual = () => (
  <div className="mt-4 space-y-8">
     {/* Step 1: Copy Link */}
    <div className="text-sm text-neutral-600 space-y-2">
       <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
             <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">1</div>
             <div className="w-0.5 h-full bg-brand-50"></div>
          </div>
          <div className="pb-4">
             <p className="font-medium text-neutral-800">Copy Scanner Link</p>
             <p className="text-xs text-neutral-500 mb-3">From the <strong>Scanner Session</strong> panel, copy the unique link.</p>
             
             {/* Mock Session Manager Link UI */}
             <div className="bg-brand-50 rounded-xl border border-neutral-100 p-4 max-w-[320px] select-none">
                 <div className="mb-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Scanner Session</div>
                 <div className="bg-white border border-neutral-200 rounded-lg p-2.5 flex items-center justify-between mb-2">
                     <span className="text-xs text-neutral-400 font-mono truncate max-w-[180px]">https://scanner.zenvy...</span>
                     <div className="p-1.5 bg-neutral-100 rounded hover:bg-neutral-200 text-neutral-500">
                         <MousePointer2 size={12} />
                     </div>
                 </div>
                 <div className="flex gap-2">
                     <div className="flex-1 py-1.5 bg-white border border-neutral-200 text-neutral-600 text-[10px] font-medium rounded-lg text-center shadow-sm">Copy Link</div>
                     <div className="flex-1 py-1.5 bg-brand-600 text-white text-[10px] font-medium rounded-lg text-center shadow-sm">Open</div>
                 </div>
             </div>
          </div>
       </div>

       {/* Step 2: Visit URL */}
       <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
             <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">2</div>
             <div className="w-0.5 h-full bg-brand-50"></div>
          </div>
          <div className="pb-4">
             <p className="font-medium text-neutral-800">Visit Link on Device</p>
             <p className="text-xs text-neutral-500">Open the copied URL on your phone or scanning device. It will look like:</p>
             <div className="mt-2 inline-block px-3 py-1.5 bg-neutral-100 text-neutral-600 font-mono text-xs rounded border border-neutral-200">
                 scanner.zenvy.com.bd?token=...
             </div>
          </div>
       </div>

       {/* Step 3: Click Add Device */}
       <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
             <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">3</div>
             <div className="w-0.5 h-full bg-brand-50"></div>
          </div>
          <div className="pb-4">
             <p className="font-medium text-neutral-800">Generate OTP</p>
             <p className="text-xs text-neutral-500 mb-3">On your main dashboard (NOT the device), click "Add Device" in the device list.</p>
             
             {/* Mock Device List Header */}
             <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 max-w-[320px] select-none">
                 <div className="flex justify-between items-center">
                     <div>
                         <div className="text-xs font-medium text-neutral-900">Connected Devices</div>
                         <div className="text-[10px] text-neutral-400">0 / 5 Devices Online</div>
                     </div>
                     <div className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm hover:bg-neutral-50">
                         <div className="w-3 h-3 text-neutral-800"><MousePointer2 size={12} className="-rotate-90" /></div>
                         <span className="text-[10px] font-bold text-neutral-800">Add Device</span>
                     </div>
                 </div>
             </div>
          </div>
       </div>

       {/* Step 4: OTP & Pair */}
       <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
             <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">4</div>
          </div>
          <div className="pb-4">
             <p className="font-medium text-neutral-800">Enter OTP to Pair</p>
             <p className="text-xs text-neutral-500 mb-3">Enter the code shown on the dashboard into your device.</p>
             
             {/* Mock OTP Modal */}
             <div className="bg-white rounded-xl border border-neutral-200 shadow-lg p-5 max-w-[280px] select-none relative">
                <div className="absolute top-2 right-2 text-neutral-300"><MousePointer2 size={12} /></div>
                <div className="text-center mb-4">
                   <div className="text-xs font-semibold text-neutral-900 mb-1">Device Pairing Code</div>
                   <div className="bg-brand-50 rounded-lg p-3">
                      <div className="text-xl font-mono font-bold text-brand-600 tracking-wider">928 412</div>
                      <div className="text-[8px] text-neutral-400 mt-1">Expires in 4:32</div>
                   </div>
                </div>
                <div className="w-full py-1.5 bg-brand-600 text-white text-[10px] font-medium rounded text-center">Copy Code</div>
             </div>
          </div>
       </div>
    </div>
  </div>
);

export const GUIDE_PHASES: Phase[] = [
  {
    id: 1,
    title: "Immediately After Event Is Published",
    description: "Your event is public. Priority: Building a reliable check-in system.",
    items: [
      { 
        id: "p1_scanner_setup", 
        label: "Setup Your Scanner System", 
        description: "Go to Event Dashboard > Scanner Tab. Activate Scanner Session to see the configuration dashboard.",
        expandedContent: <ScannerSetupVisual />
      },
      { 
        id: "p1_add_devices", 
        label: "Add / Pair Scanner Devices", 
        description: "Generate pairing codes and connect your physical scanning devices.",
        expandedContent: <AddDeviceVisual />
      },
      { id: "p1_assign_roles", label: "Assign Entry Staff Roles", description: "Designate Scanner Operators, Gate Supervisors, and Queue Managers.", isCritical: true },
      { id: "p1_fallback_prep", label: "Prepare Fallback Verification System", description: "Export Ticket Verification Sheet and save multiple offline copies (Print + Digital).", isCritical: true },
      { id: "p1_venue_setup", label: "Confirm Venue Entry Setup", description: "Finalize gate layout, signage, and power backup." },
      { id: "p1_verify_rules", label: "Verify Ticket Rules", description: "Double-check tier limits, entry times, and transfer policies." }
    ]
  },
  {
    id: 2,
    title: "24–48 Hours Before Event",
    description: "High-risk preparation window. Minimize last-minute failures.",
    items: [
      { id: "p2_reexport_sheet", label: "Re-Export Latest Ticket Sheet", description: "Download a fresh copy to include recent sales." },
      { id: "p2_test_devices", label: "Test Scanner Devices", description: "Scan a sample ticket on EACH device to confirm dashboard update and duplicate detection." },
      { id: "p2_preload_cache", label: "Preload Offline Ticket Cache", description: "Open scanner on devices while online to sync latest tickets." },
      { id: "p2_device_readiness", label: "Check Device Readiness", description: "Ensure 70%+ battery, power banks, and camera functionality." },
      { id: "p2_staff_briefing", label: "Staff Briefing Session", description: "Explain scanning, escalation, fallback procedures, and duplicate handling." }
    ]
  },
  {
    id: 3,
    title: "Event Day — Before Gates Open",
    description: "Final checks before the crowd arrives.",
    items: [
      { id: "p3_activate_session", label: "Activate Scanner Session", description: "Confirm devices show 'Connected' and scan tests are successful." },
      { id: "p3_staff_positioning", label: "Staff Positioning", description: "Deploy staff to specific gates and roles." },
      { id: "p3_fallback_station", label: "Prepare Fallback Station", description: "Setup the location with printed sheets and supervisor." },
      { id: "p3_monitor_dashboard", label: "Monitor Live Entry Dashboard", description: "Track connectivity and initial entry flow." }
    ]
  },
  {
    id: 4,
    title: "During Live Entry",
    description: "Managing the flow and handling exceptions.",
    items: [
      { id: "p4_scanning", label: "Scanner Staff: Scan & Verify", description: "Scan every ticket. Redirect failed scans to supervisor." },
      { id: "p4_supervision", label: "Supervisor: Handle Exceptions", description: "Resolve duplicate scans, invalid tickets, and device failures." },
      { id: "p4_fallback_exec", label: "Execute Fallback Procedure (If Needed)", description: "For network/device failure: Check ID on sheet, mark used, log manually." }
    ]
  },
  {
    id: 5,
    title: "After Entry Closes",
    description: "Wrap up and data reconciliation.",
    items: [
      { id: "p5_sync_manual", label: "Sync Manual Entries", description: "Update dashboard with any manual check-ins from fallback sheets." },
      { id: "p5_close_session", label: "Close Scanner Session", description: "Prevent unauthorized late scanning." },
      { id: "p5_review_analytics", label: "Review Entry Analytics", description: "Check total attendance, peak times, and duplicate attempts." }
    ]
  }
];

export const TOTAL_ITEMS = GUIDE_PHASES.reduce((acc, phase) => acc + phase.items.length, 0);
