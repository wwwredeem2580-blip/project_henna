import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DateInput = ({
    label,
    value,
    isOpen,
    onOpen,
    onClose,
    onChange,
    onNext,
    minDate,
    error,
    onFocus
}: {
    label: string,
    value: string,
    isOpen: boolean,
    onOpen: () => void,
    onClose: () => void,
    onChange: (dateStr: string) => void,
    onNext?: () => void,
    minDate?: Date,
    error?: boolean,
    onFocus?: () => void
}) => {
    const dateObj = value ? new Date(value) : (minDate || new Date());
    const [viewDate, setViewDate] = useState(dateObj);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    useEffect(() => { 
        if (isOpen) setViewDate(value ? new Date(value) : (minDate || new Date())); 
    }, [isOpen, value, minDate]);

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    const isDateDisabled = (day: number) => {
        const currentCheck = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const min = minDate ? new Date(minDate) : new Date(today.setDate(today.getDate() - 1));
        min.setHours(0,0,0,0);
        return currentCheck < min;
    };

    const handleSelect = (day: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        
        if (value) {
            const original = new Date(value);
            newDate.setHours(original.getHours(), original.getMinutes());
        } else {
            newDate.setHours(12, 0, 0, 0);
        }

        onChange(newDate.toISOString());
        onClose();
        if (onNext) setTimeout(onNext, 300);
    };

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
    for (let i = 1; i <= daysInMonth; i++) {
        const disabled = isDateDisabled(i);
        const isSelected = value && new Date(value).getDate() === i && new Date(value).getMonth() === viewDate.getMonth() && new Date(value).getFullYear() === viewDate.getFullYear();

        days.push(
            <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={(e) => handleSelect(i, e)}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                    'w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center transition-all',
                    isSelected 
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-110' 
                        : disabled 
                            ? 'text-slate-200 cursor-not-allowed' 
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )}
            >
                {i}
            </button>
        );
    }

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => { onOpen(); if(onFocus) onFocus(); }}
                className={cn(
                    'w-full bg-[#F9FAFB] rounded-2xl px-4 py-3.5 text-left flex items-center gap-3 transition-all duration-300 hover:text-brand-600 group',
                    error 
                        ? 'border-rose-400 ring-4 ring-rose-500/10 input-error' 
                        : 'border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500'
                )}
            >
                <div className={cn(
                    'p-2 rounded-xl transition-colors',
                    error 
                        ? 'bg-rose-100 text-rose-500' 
                        : 'bg-white text-brand-500 group-hover:text-brand-600 group-hover:bg-brand-50'
                )}>
                    <Calendar size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-[500] text-slate-500 tracking-wider mb-0.5">{label}</span>
                    <span className={cn(
                        'text-sm font-[500] text-slate-700',
                        value ? 'text-slate-900' : 'text-slate-500'
                    )}>
                        {value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                    </span>
                </div>
            </button>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" onClick={onClose}>
                    <div className="w-full max-w-[340px] overflow-hidden relative bg-white rounded-[32px] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 flex items-center justify-between border-b border-black/5">
                            <h3 className="text-base font-bold text-slate-900">{`Select ${label}`}</h3>
                            <button onClick={onClose} className="p-2 -mr-2 hover:bg-black/5 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <button onClick={prevMonth} className="p-2 hover:bg-black/5 rounded-xl text-slate-500 hover:text-slate-900 transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-base font-bold text-slate-900">{monthName}</span>
                                <button onClick={nextMonth} className="p-2 hover:bg-black/5 rounded-xl text-slate-500 hover:text-slate-900 transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => 
                                    <span key={d} className="text-[11px] font-bold text-slate-400 uppercase">{d}</span>
                                )}
                            </div>
                            <div className="grid grid-cols-7 gap-y-1 justify-items-center">{days}</div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
