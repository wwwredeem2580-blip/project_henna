import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy, AlertCircle } from 'lucide-react';
import { TimeInput } from '@/components/ui/TimeInput';

interface Session {
  date: string;
  startTime: string; 
  endTime: string;
  doorsOpen?: string;
}

interface ScheduleBuilderProps {
  sessions: Session[];
  onChange: (sessions: Session[]) => void;
  timezone?: string;
}

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ sessions, onChange }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'config'>('calendar');
  const [activeModal, setActiveModal] = useState<{ idx: number, field: 'start' | 'end' } | null>(null);

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  const getDaySession = (date: Date) => 
    sessions.find(s => isSameDay(new Date(s.date), date));

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0,0,0,0);
    return d;
  }, []);

  const isValidDateClick = (date: Date) => {
    if (date < minDate) return false;
    
    if (sessions.length === 0) return true;
    if (getDaySession(date)) return true;

    const newDates = [...sessions.map(s => new Date(s.date)), date].sort((a,b) => a.getTime() - b.getTime());
    
    for (let i = 0; i < newDates.length - 1; i++) {
        const diffTime = Math.abs(newDates[i+1].getTime() - newDates[i].getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1; 
        if (diffDays > 2) return false;
    }
    return true;
  };

  const handleDateClick = (date: Date) => {
    if (date < minDate) return;

    const existing = getDaySession(date);
    if (existing) {
      onChange(sessions.filter(s => !isSameDay(new Date(s.date), date)));
    } else {
      if (!isValidDateClick(date)) {
        return;
      }

      const lastSession = sessions[sessions.length - 1];
      
      const defaultStart = new Date(date);
      defaultStart.setHours(18, 0, 0, 0);
      
      const defaultEnd = new Date(date);
      defaultEnd.setHours(21, 0, 0, 0);

      if (lastSession) {
          const lsStart = new Date(lastSession.startTime);
          const lsEnd = new Date(lastSession.endTime);
          defaultStart.setHours(lsStart.getHours(), lsStart.getMinutes());
          defaultEnd.setHours(lsEnd.getHours(), lsEnd.getMinutes());
      }
      
      const newSession: Session = {
        date: date.toISOString(),
        startTime: defaultStart.toISOString(),
        endTime: defaultEnd.toISOString()
      };
      
      const newSessions = [...sessions, newSession].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      onChange(newSessions);
    }
  };

  const renderCalendar = () => {
      const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
      const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
      const firstDayIdx = monthStart.getDay();
      
      const days = [];
      for (let i = 0; i < firstDayIdx; i++) days.push(<div key={`empty-${i}`} />);
      for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
          const isSelected = !!getDaySession(date);
          const disabled = date < minDate || (!isSelected && !isValidDateClick(date));
          
          days.push(
              <button
                  key={i}
                  onClick={() => handleDateClick(date)}
                  disabled={disabled}
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isSelected 
                        ? 'bg-brand-500 text-white shadow-md scale-105' 
                        : disabled 
                            ? 'text-slate-200 cursor-not-allowed' 
                            : 'text-slate-700 hover:bg-brand-50 hover:text-brand-600'
                    }
                  `}
              >
                  {i}
              </button>
          );
      }
      return days;
  };

  const updateSession = (index: number, updates: Partial<Session>) => {
      const newSessions = [...sessions];
      newSessions[index] = { ...newSessions[index], ...updates };
      onChange(newSessions);
  };

  const copyToAll = (sourceIndex: number) => {
      const source = sessions[sourceIndex];
      const sStart = new Date(source.startTime);
      const sEnd = new Date(source.endTime);
      const sDoors = source.doorsOpen ? new Date(source.doorsOpen) : undefined;

      const newSessions = sessions.map(s => {
          const newStart = new Date(s.date);
          newStart.setHours(sStart.getHours(), sStart.getMinutes());
          
          const newEnd = new Date(s.date);
          newEnd.setHours(sEnd.getHours(), sEnd.getMinutes());

          let newDoors;
          if (sDoors) {
             newDoors = new Date(s.date);
             newDoors.setHours(sDoors.getHours(), sDoors.getMinutes());
          }

          return {
              ...s,
              startTime: newStart.toISOString(),
              endTime: newEnd.toISOString(),
              doorsOpen: newDoors?.toISOString()
          };
      });
      onChange(newSessions);
  };

  return (
    <div className="bg-white rounded-tr-xl rounded-bl-xl overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-3 text-xs font-[400] transition-colors ${
            activeTab === 'calendar' 
              ? 'text-brand-600 bg-brand-50/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Select Dates ({sessions.length})
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          disabled={sessions.length === 0}
          className={`flex-1 py-3 text-xs font-[400] transition-colors ${
            activeTab === 'config' 
              ? 'text-brand-600 bg-brand-50/50' 
              : 'text-slate-500 hover:text-slate-700 disabled:opacity-50'
          }`}
        >
          Configure Times
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'calendar' ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 max-w-[350px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} 
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-[400] text-md text-slate-900">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} 
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => 
                        <span key={d} className="text-xs font-bold text-slate-400 uppercase tracking-widest">{d}</span>
                    )}
                </div>
                <div className="grid grid-cols-7 gap-y-2 justify-items-center">
                    {renderCalendar()}
                </div>
                <div className="mt-6 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <p>Select multiple dates for your event. Maximum 2 day gap between sessions.</p>
                </div>
            </div>
        ) : (
            <div className="space-y-6 mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                {sessions.map((session, idx) => (
                    <div key={session.date} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-[400] text-sm text-slate-900">
                                {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h4>
                            {idx === 0 && sessions.length > 1 && (
                                <button 
                                    onClick={() => copyToAll(0)} 
                                    className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                >
                                    <Copy size={12} /> Apply to all
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <TimeInput
                                    label="Start Time"
                                    value={session.startTime}
                                    isOpen={activeModal?.idx === idx && activeModal?.field === 'start'}
                                    onOpen={() => setActiveModal({ idx, field: 'start' })}
                                    onClose={() => setActiveModal(null)}
                                    onChange={(val) => updateSession(idx, { startTime: val })}
                                />
                            </div>
                            <div>
                                <TimeInput
                                    label="End Time"
                                    value={session.endTime}
                                    isOpen={activeModal?.idx === idx && activeModal?.field === 'end'}
                                    onOpen={() => setActiveModal({ idx, field: 'end' })}
                                    onClose={() => setActiveModal(null)}
                                    onChange={(val) => updateSession(idx, { endTime: val })}
                                    minTime={session.startTime}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
