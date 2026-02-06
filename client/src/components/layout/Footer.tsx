'use client'

import React from 'react';
import { Logo } from '../shared/Logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const Footer: React.FC = () => {
  return (
    <footer className={`pt-24 lg:ml-64 pb-12 px-6 bg-white border-t border-brand-200`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <Logo variant='full' />
          </div>
          <p className="text-neutral-400 text-sm font-[300] leading-relaxed">
            Engineering high-fidelity hybrid human experiences. The standard for modern event architecture.
          </p>
        </div>

        <div className="space-y-6">
          <h4 className="text-neutral-950 font-light uppercase tracking-widest text-xs">Platform</h4>
          <ul className="space-y-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">
            <li><a href="/events" className="hover:text-brand-600 transition-colors font-medium">Explore Events</a></li>
            <li><a href="/learn" className="hover:text-brand-600 transition-colors font-medium">Learn</a></li>
            <li><a href="/about" className="hover:text-brand-600 transition-colors font-medium">About Zenvy</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-neutral-950 font-light uppercase tracking-widest text-xs">Organizers</h4>
          <ul className="space-y-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">
            <li><a href="/host/events/create" className="hover:text-brand-600 transition-colors font-medium">Sell Tickets</a></li>
            <li><a href="/dashboard" className="hover:text-brand-600 transition-colors font-medium">Dashboard</a></li>
            <li><a href="/host/analytics" className="hover:text-brand-600 transition-colors font-medium">Analytics</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-neutral-950 font-light uppercase tracking-widest text-xs">Support</h4>
          <ul className="space-y-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">
            <li><a href="/help" className="hover:text-brand-600 transition-colors font-medium">Help Center</a></li>
            <li><a href="/contact" className="hover:text-brand-600 transition-colors font-medium">Contact Us</a></li>
            <li><a href="/status" className="hover:text-brand-600 transition-colors font-medium">System Status</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 border-t border-brand-200 flex flex-col sm:flex-row justify-between items-center text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-300">
         <p>© 2026 Zenvy Inc.</p>
         <div className="flex gap-8 mt-4 sm:mt-0">
           <a href="/legal/privacy" className="hover:text-brand-600">Privacy</a>
           <a href="/legal/security" className="hover:text-brand-600">Security</a>
           <a href="/legal/terms" className="hover:text-brand-600">Terms</a>
         </div>
      </div>
    </footer>
  );
};
