interface SwitchProps {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default ({ label, sub, checked, onChange }: SwitchProps) => (
  <label className="flex gap-2 items-center justify-between cursor-pointer group">
    <div className="flex-1">
      <p className="text-[15px] font-normal text-neutral-800">{label}</p>
      {sub && <p className="text-[10px] text-neutral-400 font-normal uppercase tracking-widest mt-0.5">{sub}</p>}
    </div>
    <div className={`w-9.5 h-5 rounded-full transition-all relative ${checked ? 'bg-brand-500 shadow-inner' : 'bg-slate-200'}`}>
       <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${checked ? 'left-5' : 'left-0.5'}`} />
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="hidden"
    />
  </label>
);
