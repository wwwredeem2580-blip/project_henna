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
                    'w-9 h-9 rounded-none text-[13px] font-medium flex items-center justify-center transition-all',
                    isSelected 
                        ? 'bg-black text-white' 
                        : disabled 
                            ? 'text-gray-200 cursor-not-allowed' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-black'
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
                    'w-full bg-white border outline-none px-4 py-3 text-left flex items-center gap-3 transition-colors group',
                    error 
                        ? 'border-red-400 focus:border-red-500' 
                        : 'border-gray-300 hover:border-black focus:border-black'
                )}
            >
                <div className={cn(
                    'p-1.5 transition-colors',
                    error 
                        ? 'bg-red-50 text-red-500' 
                        : 'bg-gray-50 text-wix-text-dark group-hover:bg-gray-100'
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
                    <div className="w-full max-w-[340px] overflow-hidden relative bg-white border border-gray-300 shadow-xl" onClick={e => e.stopPropagation()}>
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
