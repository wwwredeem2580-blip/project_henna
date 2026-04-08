"use client";

import { motion } from "motion/react";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export default function ContactUs() {
  return (
    <section className="px-6 lg:px-12 py-12 lg:py-24 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl lg:text-6xl font-semibold mb-8"
          >
            Get in Touch
          </motion.h2>
          <p className="text-lg text-ink-muted mb-12 max-w-md">
            Whether you're planning a wedding, an event, or just want to say hello, we'd love to hear from you.
          </p>

          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center text-ink-muted">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Email</p>
                <p className="text-lg">hello@riashenna.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center text-ink-muted">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Phone</p>
                <p className="text-lg">+880 1234 567890</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center text-ink-muted">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Studio</p>
                <p className="text-lg">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 bg-ink/[0.02] p-8 lg:p-12 border border-ink/5"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-transparent border-b border-ink/10 py-3 focus:outline-none focus:border-ink transition-colors"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-transparent border-b border-ink/10 py-3 focus:outline-none focus:border-ink transition-colors"
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Message</label>
            <textarea 
              rows={4}
              className="w-full bg-transparent border-b border-ink/10 py-3 focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="Tell us about your event"
            />
          </div>
          <button className="w-full bg-ink text-bg py-4 uppercase tracking-[0.2em] text-xs hover:bg-ink/90 transition-all">
            Send Message
          </button>
        </motion.form>
      </div>
    </section>
  );
}
