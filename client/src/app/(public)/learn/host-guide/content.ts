export interface GuideItem {
  id: string;
  label: string;
  description?: string;
  isCritical?: boolean;
}

export interface Phase {
  id: number;
  title: string;
  description: string;
  items: GuideItem[];
}

export const GUIDE_PHASES: Phase[] = [
  {
    id: 1,
    title: "Immediately After Event Is Published",
    description: "Your event is public. Priority: Building a reliable check-in system.",
    items: [
      { id: "p1_scanner_setup", label: "Setup Your Scanner System", description: "Go to Event Dashboard > Scanner Tab. Activate Scanner Session and add scanner devices." },
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
