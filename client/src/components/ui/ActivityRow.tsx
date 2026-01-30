import { LucideIcon } from 'lucide-react';

interface ActivityRowProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: string; // e.g. "text-emerald-500"
}

export default function ActivityRow({ label, value, icon: Icon, color = "text-brand-500" }: ActivityRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-2 bg-white rounded-xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon size={18} />
        </div>
        <p className="text-sm font-[300] text-slate-700">{label}</p>
      </div>
      <p className="text-sm font-[400] text-slate-900">{value}</p>
    </div>
  );
}
