"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Booking } from "../types";
import { Check, X } from "lucide-react";
import { CustomDropdown } from "./ui/CustomDropdown";
import { CustomCalendar } from "./ui/CustomCalendar";
import { useStore } from "../context/StoreContext";
import { useRouter } from "next/navigation";

export function BookingForm() {
  const { designs, selectedDesign, setSelectedDesign, bookings, setBookings, availabilitySettings } = useStore();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    phone: "",
    location: "",
    locationType: "artist_location" as "artist_location" | "user_location",
    eventType: "wedding",
    people: "1",
    info: "",
    time: ""
  });

  const [personDesigns, setPersonDesigns] = useState<Record<number, string>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [transactionId, setTransactionId] = useState("");

  const generateTimeSlots = (date?: string) => {
    const slots = [];
    let [startH, startM] = availabilitySettings.startTime.split(":").map(Number);
    let [endH, endM] = availabilitySettings.endTime.split(":").map(Number);
    
    let currentH = startH;
    let currentM = startM;
    
    while (currentH < endH || (currentH === endH && currentM <= endM)) {
      const timeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
      
      // If date is provided, only return available slots
      if (date && !isSlotAvailable(date, timeStr)) {
        currentM += 30;
        if (currentM >= 60) {
          currentH += 1;
          currentM -= 60;
        }
        continue;
      }

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

  const isSlotAvailable = (date: string, time: string) => {
    // Check confirmed bookings
    const dailyBookings = bookings.filter(b => b.date === date && b.status === "confirmed");
    const isBooked = dailyBookings.some(b => {
      if (!b.endTime) return b.time === time; // Legacy or single-slot
      return time >= b.time && time < b.endTime;
    });
    if (isBooked) return false;

    // Check manual blocks
    const dailyBlocks = availabilitySettings.blockedSlots.filter(s => s.date === date);
    const isBlocked = dailyBlocks.some(s => time >= s.startTime && time < s.endTime);
    if (isBlocked) return false;

    return true;
  };

  const bookedDates = bookings.reduce((acc: string[], b) => {
    if (b.status !== "confirmed") return acc;
    if (!acc.includes(b.date)) {
      // Check if ALL slots for this date are taken
      const slots = generateTimeSlots(b.date);
      const allTaken = slots.length === 0;
      if (allTaken) acc.push(b.date);
    }
    return acc;
  }, []);

  const eventOptions = [
    { value: "wedding", label: "Wedding" },
    { value: "engagement", label: "Engagement" },
    { value: "party", label: "Party / Celebration" },
    { value: "other", label: "Other" },
  ];

  const timeOptions = generateTimeSlots(formData.date);

  const calculateTotal = () => {
    let designTotal = 0;
    const numPeople = parseInt(formData.people) || 1;

    if (numPeople > 1) {
      for (let i = 0; i < numPeople; i++) {
        const dId = personDesigns[i] || selectedDesign?.id;
        const design = designs.find(d => d.id === dId);
        designTotal += design?.price || 0;
      }
    } else {
      designTotal = selectedDesign?.price || 0;
    }

    const travelFee = formData.locationType === "user_location" ? availabilitySettings.travelFee : 0;
    return designTotal + travelFee;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (availabilitySettings.paymentMethods.length > 0) {
      setSelectedPaymentMethod(availabilitySettings.paymentMethods[0].id);
    }
    setShowPaymentModal(true);
  };

  const confirmBooking = () => {
    const numPeople = parseInt(formData.people) || 1;
    const multiPersonDesigns = numPeople > 1 ? 
      Array.from({ length: numPeople }).map((_, i) => ({
        personIndex: i,
        designId: personDesigns[i] || selectedDesign?.id || ""
      })) : undefined;

    const newBooking: Booking = {
      ...formData,
      id: Date.now().toString(),
      status: "pending",
      designId: selectedDesign?.id,
      designs: multiPersonDesigns,
      extraFee: formData.locationType === "user_location" ? availabilitySettings.travelFee : 0,
      prepaymentAmount: availabilitySettings.prepaymentAmount,
      paymentMethodId: selectedPaymentMethod,
      transactionId: transactionId,
      createdAt: new Date().toISOString()
    };
    setBookings([...bookings, newBooking]);
    setSubmitted(true);
    setShowPaymentModal(false);
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
            You will recieve confirmation callback from us soon. Thanks for choosing Ria’s Henna Artistry.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({...formData, date: "", time: "", info: ""}); // Reset some fields
              setSelectedDesign(null);
              router.push("/");
            }}
            className="mt-8 bg-ink text-bg px-8 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all w-full"
          >
            Close & Return Home
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

          {parseInt(formData.people) > 1 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-6 pt-4 border-t border-ink/5"
            >
              <label className="text-[10px] uppercase tracking-widest text-ink-muted block">Design Selection per Person</label>
              <div className="grid grid-cols-1 gap-6">
                {Array.from({ length: parseInt(formData.people) }).map((_, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-ink/5 rounded-sm">
                    <span className="text-xs font-serif">Person {i + 1}</span>
                    <select
                      value={personDesigns[i] || selectedDesign?.id || ""}
                      onChange={(e) => setPersonDesigns({ ...personDesigns, [i]: e.target.value })}
                      className="bg-transparent border-b border-ink/10 py-1 text-xs outline-none focus:border-ink min-w-[200px]"
                    >
                      <option value="">Select a design</option>
                      {designs.map(d => (
                        <option key={d.id} value={d.id}>{d.title} - Tk {d.price}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted block">Service Location</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, locationType: "artist_location" })}
                className={`p-4 border text-[10px] uppercase tracking-widest transition-all ${
                  formData.locationType === "artist_location" ? "border-ink bg-ink text-bg" : "border-ink/10 hover:border-ink/30"
                }`}
              >
                Come to Our Location
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, locationType: "user_location" })}
                className={`p-4 border text-[10px] uppercase tracking-widest transition-all ${
                  formData.locationType === "user_location" ? "border-ink bg-ink text-bg" : "border-ink/10 hover:border-ink/30"
                }`}
              >
                Artist goes to you (+Tk {availabilitySettings.travelFee})
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">
              {formData.locationType === "user_location" ? "Your Location Address" : "Branch Preference (Optional)"}
            </label>
            <input 
              required={formData.locationType === "user_location"}
              type="text" 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors" 
              placeholder={formData.locationType === "user_location" ? "House, Road, Area" : "Select a branch or leave empty"} 
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
                    onClick={() => setSelectedDesign(null)}
                    className="absolute top-2 right-2 p-1 bg-ink text-bg rounded-full hover:scale-110 transition-transform"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-muted mb-1">Design Choice</p>
                  <p className="text-lg font-serif">{selectedDesign.title}</p>
                </div>
                <div className="pt-6 border-t border-ink/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Service Total</span>
                    <span className="font-medium">Tk {calculateTotal() - (formData.locationType === "user_location" ? availabilitySettings.travelFee : 0)}</span>
                  </div>
                  {formData.locationType === "user_location" && (
                    <div className="flex justify-between text-sm text-rose-600">
                      <span className="">Travel Fee</span>
                      <span className="font-medium">+Tk {availabilitySettings.travelFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-serif pt-2 border-t border-ink/5">
                    <span>Total Amount</span>
                    <span>Tk {calculateTotal()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <p className="text-sm text-ink-muted italic">No design selected yet.</p>
                <button 
                  onClick={() => router.push("/designs")}
                  type="button"
                  className="text-[10px] uppercase tracking-widest border-b border-ink/20 pb-1"
                >
                  Browse Designs
                </button>
              </div>
            )}
          </div>

          {showPaymentModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowPaymentModal(false)}
                className="absolute inset-0 bg-ink/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-bg max-w-md w-full p-8 lg:p-10 shadow-2xl rounded-sm text-center"
              >
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-ink/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                {paymentStep === 1 ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif">Secure Pre-booking</h3>
                      <p className="text-xs text-ink-muted uppercase tracking-widest">Select Payment Method</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {availabilitySettings.paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`flex flex-col items-center justify-center p-3 border rounded-sm transition-all space-y-2 ${
                            selectedPaymentMethod === method.id ? "border-ink bg-ink/5" : "border-ink/10 hover:border-ink/20"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] uppercase tracking-tighter ${
                            selectedPaymentMethod === method.id ? "bg-ink text-bg" : "bg-ink/5 text-ink-muted"
                          }`}>
                            {method.name.substring(0, 1)}
                          </div>
                          <span className="text-[9px] uppercase tracking-widest">{method.name}</span>
                        </button>
                      ))}
                    </div>

                    {selectedPaymentMethod && (() => {
                      const method = availabilitySettings.paymentMethods.find(m => m.id === selectedPaymentMethod);
                      return (
                        <div className="bg-ink/5 p-6 rounded-sm space-y-4">
                          <p className="text-sm">To confirm your slot, a pre-payment of <span className="font-bold">Tk {availabilitySettings.prepaymentAmount}</span> is required.</p>
                          <p className="text-[10px] text-ink-muted leading-relaxed">{method?.instruction}</p>
                          
                          <div className="aspect-square w-48 mx-auto bg-white p-2 border border-ink/10 rounded-sm overflow-hidden">
                            {method?.qrCode ? (
                              <img src={method.qrCode} alt={`${method.name} QR`} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full bg-ink/5 flex items-center justify-center border-2 border-dashed border-ink/20">
                                <span className="text-[10px] uppercase tracking-widest text-ink/30">No QR Code</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] uppercase tracking-widest text-ink-muted">Scan to pay with {method?.name}</p>
                        </div>
                      );
                    })()}

                    <button 
                      onClick={() => setPaymentStep(2)}
                      disabled={!selectedPaymentMethod}
                      className="w-full bg-ink text-bg py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all disabled:opacity-50"
                    >
                      I Have Paid
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif">Transaction Details</h3>
                      <p className="text-xs text-ink-muted uppercase tracking-widest">Verify Your Payment</p>
                    </div>

                    <div className="space-y-4 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-ink-muted">bKash Transaction ID</label>
                      <input 
                        required
                        type="text" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full bg-transparent border-b border-ink/10 py-3 focus:border-ink outline-none transition-colors font-mono" 
                        placeholder="e.g. 8N7X2L9P"
                      />
                      <p className="text-[9px] text-ink-muted">Please paste the transaction ID received in your bKash confirmation SMS.</p>
                    </div>

                    <button 
                      onClick={confirmBooking}
                      disabled={!transactionId}
                      className="w-full bg-ink text-bg py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm & Book Now
                    </button>
                    <button 
                      onClick={() => setPaymentStep(1)}
                      className="text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink underline"
                    >
                      Back to QR Code
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}

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
