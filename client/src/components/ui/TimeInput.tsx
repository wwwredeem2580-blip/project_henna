import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, X, AlertCircle } from 'lucide-react';
import { ScrollColumn, HOURS, MINUTES, AMPM, TIME_PRESETS } from './DateTimeShared';
import { cn } from '@/lib/utils';

export const TimeInput = ({
    label,
    value,
    isOpen,
    onOpen,
    onClose,
    onChange,
    minTime,
    error
}: {
    label: string,
    value: string,
    isOpen: boolean,
    onOpen: () => void,
    onClose: () => void,
    onChange: (dateStr: string) => void,
    minTime?: string,
    defaultDate?: Date,
    error?: boolean
}) => {
    const dateObj = value ? new Date(value) : new Date();
    const [hour, setHour] = useState(dateObj.getHours() % 12 || 12);
    const [minute, setMinute] = useState(dateObj.getMinutes().toString().padStart(2,'0'));
    const [period, setPeriod] = useState(dateObj.getHours() >= 12 ? 'PM' : 'AM');
    const [validationError, setValidationError] = useState<string | null>(null);

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
        if(isOpen && value) {
            const d = new Date(value);
            setHour(d.getHours() % 12 || 12);
            setMinute(d.getMinutes().toString().padStart(2,'0'));
            setPeriod(d.getHours() >= 12 ? 'PM' : 'AM');
            setValidationError(null);
        }
    }, [isOpen, value]);

    const handleConfirm = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let h = Number(hour);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;

        const d = value ? new Date(value) : new Date();
        d.setHours(h);
        d.setMinutes(parseInt(minute));

        if (minTime) {
            const minDate = new Date(minTime);
            if (d <= minDate) {
                setValidationError('Time must be later than start time');
                return;
            }
        }

        onChange(d.toISOString());
        onClose();
    };

    const handleHourSelect = (h: string | number) => {
        setHour(Number(h));
        setValidationError(null);
    };

    const handleMinuteSelect = (m: string | number) => {
        setMinute(m.toString());
        setValidationError(null);
    };

    const handlePeriodSelect = (p: string | number) => {
        setPeriod(p.toString());
        setValidationError(null);
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={onOpen}
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
                    <Clock size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-[500] text-slate-500 tracking-wider mb-0.5">{label}</span>
                    <span className={cn(
                        'text-sm font-[500] text-slate-700',
                        value ? 'text-slate-900' : 'text-slate-500'
                    )}>
                        {value ? new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Select Time'}
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
                            <div className="relative h-[240px] flex items-center justify-center gap-1 px-2 mb-6">
                                <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-[48px] bg-gray-50 -z-10 border border-gray-200"></div>
                                <div className="flex-1 text-center">
                                    <ScrollColumn items={HOURS} selected={hour} onSelect={handleHourSelect} />
                                </div>
                                <div className="text-xl font-bold text-slate-300 pb-1 w-4 flex justify-center tracking-tighter">:</div>
                                <div className="flex-1 text-center">
                                    <ScrollColumn items={MINUTES} selected={minute} onSelect={handleMinuteSelect} />
                                </div>
                                <div className="flex-1 text-center">
                                    <ScrollColumn items={AMPM} selected={period} onSelect={handlePeriodSelect} />
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wide">Presets</p>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {TIME_PRESETS.map((p) => (
                                        <button 
                                            key={p.label} 
                                            onClick={() => { 
                                                setHour(p.h); 
                                                setMinute(p.m); 
                                                setPeriod(p.p); 
                                                setValidationError(null); 
                                            }} 
                                            className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 hover:border-wix-text-dark hover:text-wix-text-dark hover:bg-gray-50 transition-all whitespace-nowrap active:scale-95 bg-white"
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {validationError && (
                                <div className="mb-4 flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl text-xs font-semibold animate-slide-up">
                                    <AlertCircle size={16} />
                                    {validationError}
                                </div>
                            )}

                            <button 
                                onClick={(e) => handleConfirm(e)} 
                                className="w-full bg-wix-text-dark text-white py-3 font-medium hover:bg-black transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
