"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Design, Booking, AvailabilitySettings } from "../types";
import { Check, X } from "lucide-react";
import { CustomDropdown } from "./ui/CustomDropdown";
import { CustomCalendar } from "./ui/CustomCalendar";

interface BookingFormProps {
  selectedDesign: Design | null;
  onClearDesign: () => void;
  onAddBooking: (booking: Booking) => void;
  bookings: Booking[];
  availabilitySettings: AvailabilitySettings;
}

export function BookingForm({ selectedDesign, onClearDesign, onAddBooking, bookings, availabilitySettings }: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    phone: "",
    location: "",
    eventType: "wedding",
    people: "1",
    info: "",
    time: ""
  });

  const bookedDates = bookings.filter(b => b.status === "confirmed").map(b => b.date);

  const eventOptions = [
    { value: "wedding", label: "Wedding" },
    { value: "engagement", label: "Engagement" },
    { value: "party", label: "Party / Celebration" },
    { value: "other", label: "Other" },
  ];

  // Generate time slots based on availability settings
  // E.g. "12:30" to "22:00" in 30 min intervals
  const generateTimeSlots = () => {
    const slots = [];
    let [startH, startM] = availabilitySettings.startTime.split(":").map(Number);
    let [endH, endM] = availabilitySettings.endTime.split(":").map(Number);
    
    let currentH = startH;
    let currentM = startM;
    
    while (currentH < endH || (currentH === endH && currentM <= endM)) {
      const timeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
      const ampm = currentH >= 12 ? 'PM' : 'AM';
      const displayH = currentH > 12 ? currentH - 12 : (currentH === 0 ? 12 : currentH);
      const displayTime = `${displayH}:${currentM.toString().padStart(2, '0')} ${ampm}`;
      
      slots.push({ value: timeStr, label: displayTime });
      
      currentM += 30;
      if (currentM >= 60) {
        currentH += 1;
        currentM -= 60;
      }
    }
    return slots;
  };

  const timeOptions = generateTimeSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: Booking = {
      ...formData,
      id: Date.now().toString(),
      status: "pending",
      designId: selectedDesign?.id,
      createdAt: new Date().toISOString()
    };
    onAddBooking(newBooking);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-bg max-w-md w-full p-8 lg:p-12 text-center space-y-6 shadow-2xl rounded-sm"
        >
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Check className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-serif">Prebooking Successful</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Prebooking successful, you will be getting a booking confirmation callback.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({...formData, date: "", time: "", info: ""}); // Reset some fields
              onClearDesign();
            }}
            className="mt-8 bg-ink text-bg px-8 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all w-full"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="px-6 lg:px-12 py-12 lg:py-24 min-h-screen max-w-5xl">
      <div className="mb-12 lg:mb-16">
        <h2 className="text-4xl lg:text-5xl font-serif mb-4">Pre-booking</h2>
        <p className="text-ink-muted uppercase tracking-widest text-xs">Secure your date with our professional artists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Full Name</label>
              <input 
                required 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors" 
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Email Address</label>
              <input 
                required 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors" 
                placeholder="Email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <CustomCalendar 
                label="Event Date" 
                value={formData.date} 
                onChange={(date) => setFormData({ ...formData, date, time: "" })} 
                bookedDates={bookedDates}
                availableDays={availabilitySettings.availableDays}
              />
              {formData.date && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <CustomDropdown 
                    label="Select Time" 
                    options={timeOptions} 
                    value={formData.time} 
                    onChange={(val) => setFormData({ ...formData, time: val })} 
                  />
                </motion.div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Phone Number</label>
              <input 
                required 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors" 
                placeholder="Phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CustomDropdown 
              label="Event Type" 
              options={eventOptions} 
              value={formData.eventType} 
              onChange={(val) => setFormData({ ...formData, eventType: val })} 
            />
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Number of People</label>
              <input 
                required 
                type="number" 
                min="1" 
                value={formData.people}
                onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors" 
                placeholder="e.g. 1" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Event Location</label>
            <input 
              required 
              type="text" 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors" 
              placeholder="Venue name or address" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Additional Information</label>
            <textarea 
              rows={4} 
              value={formData.info}
              onChange={(e) => setFormData({ ...formData, info: e.target.value })}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors resize-none" 
              placeholder="Number of guests, specific requirements, etc." 
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-ink text-bg py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-ink/90 transition-colors"
          >
            Confirm Pre-booking
          </button>
        </form>

        <div className="space-y-8">
          <div className="p-6 lg:p-10 border border-ink/5 bg-white/50 backdrop-blur-sm rounded-sm">
            <h3 className="text-xl font-serif mb-6">Selected Service</h3>
            
            {selectedDesign ? (
              <div className="space-y-6">
                <div className="relative aspect-video overflow-hidden rounded-sm">
                  <img src={selectedDesign.images[0]} alt={selectedDesign.title} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                  <button 
                    onClick={onClearDesign}
                    className="absolute top-2 right-2 p-1 bg-ink text-bg rounded-full hover:scale-110 transition-transform"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-muted mb-1">Design Choice</p>
                  <p className="text-lg font-serif">{selectedDesign.title}</p>
                </div>
                <div className="pt-6 border-t border-ink/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Service Fee</span>
                    <span>Starting from $150</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <p className="text-sm text-ink-muted italic">No design selected yet.</p>
                <button 
                  onClick={() => {}} // This should trigger navigation to designs
                  className="text-[10px] uppercase tracking-widest border-b border-ink/20 pb-1"
                >
                  Browse Designs
                </button>
              </div>
            )}
          </div>

          <div className="p-6 lg:p-10 border border-ink/5 bg-white/50 backdrop-blur-sm rounded-sm space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">Booking Policy</h3>
            <ul className="text-xs text-ink-muted space-y-3 leading-relaxed">
              <li>• 50% deposit required for confirmation</li>
              <li>• Cancellations must be made 7 days prior</li>
              <li>• Travel fees may apply for outside city limits</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
