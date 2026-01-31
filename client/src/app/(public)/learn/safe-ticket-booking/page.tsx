'use client';

import React from 'react';
import { LearnHero } from '@/components/public/learn/LearnHero';
import { LearnSection } from '@/components/public/learn/LearnSection';
import { QrCode, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SafeBookingPage() {
  return (
    <div className="w-full">
      <LearnHero
        title="Safe Ticket Booking"
        subtitle="From click to check-in, your ticket journey is encrypted, reserved, and guaranteed."
        category="User Guide"
        lastUpdated="January 2026"
      />

      <LearnSection title="The Booking Process">
        <div className="relative border-l border-neutral-200 pl-8 space-y-12 my-8">
            <div className="relative">
                <span className="absolute -left-[41px] bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-neutral-0">1</span>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Reservation</h3>
                <p>When you add tickets to your cart, our system instantly locks them for you. This prevents "overselling," ensuring that if you pay, you definitely get a ticket, even if thousands are booking simultaneously.</p>
            </div>
            <div className="relative">
                <span className="absolute -left-[41px] bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-neutral-0">2</span>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Secure Payment</h3>
                <p>We use industry-leading payment gateways with encrypted processing. Your financial data never touches our servers directly.</p>
            </div>
            <div className="relative">
                <span className="absolute -left-[41px] bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-neutral-0">3</span>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Instant Delivery</h3>
                <p>Tickets are instantly delivered to your Zenvy Wallet. You also receive a PDF copy via email with a high-resolution QR code.</p>
            </div>
        </div>
      </LearnSection>

      <LearnSection title="Your Ticket Wallet">
        <p className="mb-6">
            Your "Wallet" is your secure dashboard for all event access.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-neutral-100 rounded-2xl flex gap-4 bg-neutral-50/50">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-brand-600"><QrCode size={20}/></div>
                <div>
                    <h4 className="font-medium text-neutral-900 text-sm">Dynamic QR Codes</h4>
                    <p className="text-xs text-neutral-500 mt-1">Each ticket has a unique cryptographic hash. Screenshots might not work at some venues—always use the app or official PDF.</p>
                </div>
            </div>
             <div className="p-5 border border-neutral-100 rounded-2xl flex gap-4 bg-neutral-50/50">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-brand-600"><CreditCard size={20}/></div>
                <div>
                    <h4 className="font-medium text-neutral-900 text-sm">Engraved Invitations</h4>
                    <p className="text-xs text-neutral-500 mt-1">Premium events generate a custom "Card" with your name engraved visually, serving as a digital souvenir.</p>
                </div>
            </div>
        </div>
      </LearnSection>

      <LearnSection title="Avoiding Scams">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-amber-800 font-medium mb-4">
                <AlertTriangle size={18} />
                <span>Critical Safety Warnings</span>
            </div>
             <ul className="space-y-3 list-disc pl-5 text-sm text-amber-900/80">
                <li><strong>Never buy resale tickets on social media.</strong> Scalpers often sell the same PDF to multiple people. Since our scanners only admit the first scan, you will be denied entry.</li>
                <li><strong>Only trust Zenvy.com.bd.</strong> We are the primary issuer. We do not currently support third-party resale.</li>
                <li><strong>Verify the URL.</strong> Ensure you are on <code>https://zenvy.com.bd</code> (or our official local domain) before entering payment details.</li>
            </ul>
        </div>
      </LearnSection>
      
      <LearnSection title="Ticket Limits">
        <p>
            To prevent scalping, we enforce strict limits:
        </p>
        <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Max <strong>5 tickets</strong> per account per paid event.</li>
            <li>Max <strong>2 free tickets</strong> per account per event.</li>
            <li>Monthly free ticket claim limits to prevent abuse.</li>
            <li><strong>Email verification required</strong> before claiming any free ticket.</li>
        </ul>
      </LearnSection>
    </div>
  );
}
