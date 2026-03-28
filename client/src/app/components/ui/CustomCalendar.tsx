"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CustomCalendarProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  bookedDates?: string[];
  availableDays?: number[];
}

export function CustomCalendar({ value, onChange, label, bookedDates = [], availableDays }: CustomCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    onChange(dateString);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty slots for previous month's days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Actual days of the month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      const isSelected = value === dateString;
      const isToday = new Date().toDateString() === dateObj.toDateString();
      
      // Determine if date is disabled
      const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
      const isDayNotAllowed = availableDays ? !availableDays.includes(dateObj.getDay()) : false;
      const isGloballyBooked = bookedDates.includes(dateString);
      const isDisabled = isPast || isDayNotAllowed || isGloballyBooked;

      days.push(
        <button
          key={d}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDateSelect(d)}
          className={`h-10 w-10 flex items-center justify-center text-xs rounded-full transition-all duration-300 ${
            isDisabled 
              ? "text-ink/20 cursor-not-allowed line-through" 
              : isSelected 
                ? "bg-ink text-bg" 
                : isToday 
                  ? "border border-ink/20 text-ink hover:bg-ink/5" 
                  : "hover:bg-ink/5 text-ink hover:bg-ink/5"
          }`}
        >
          {d}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="space-y-2 relative" ref={calendarRef}>
      <label className="text-[10px] uppercase tracking-widest text-ink-muted">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors text-left font-serif"
      >
        <span className={value ? "text-ink" : "text-ink-muted font-serif italic opacity-50"}>
          {value ? new Date(value).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Select date"}
        </span>
        <CalendarIcon size={14} className="text-ink-muted" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-bg border border-ink/5 shadow-2xl rounded-sm p-4 lg:p-6 w-[calc(100vw-3rem)] sm:w-[320px]"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-serif text-lg">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h4>
              <div className="flex space-x-2">
                <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-ink/5 rounded-full transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-ink/5 rounded-full transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="h-10 w-10 flex items-center justify-center text-[10px] uppercase tracking-widest text-ink-muted font-semibold">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderDays()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
