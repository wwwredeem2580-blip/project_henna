'use client';

import React from 'react';
import { LearnHero } from '@/components/learn/LearnHero';
import { LearnSection } from '@/components/learn/LearnSection';
import { RefreshCw, CheckCircle2, XCircle, Scale } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="w-full">
      <LearnHero
        title="Refund Policy Explained"
        subtitle="Our consumer trust backbone. Clear rules on when and how you get your money back."
        category="Policy"
        lastUpdated="January 2026"
      />

      <LearnSection title="Standard Refund Window">
        <p className="text-lg text-neutral-800 font-medium mb-4">
             7-Day "No Questions Asked" Window
        </p>
        <p className="mb-4">
            Attendees may request refunds within <strong>7 days of purchase</strong>, provided that:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-neutral-600 mb-6">
            <li>The event is still more than 7 days away.</li>
            <li>The ticket has not been scanned or used.</li>
            <li>The event's specific terms (set by organizer) do not explicitly override this with "No Refunds" (rare and clearly marked).</li>
        </ul>
      </LearnSection>

      <LearnSection title="Automatic Refund Scenarios">
        <p className="mb-4">
            In these cases, Zenvy issues <strong>Full Refunds</strong> automatically. No organizer approval is required.
        </p>
        <div className="space-y-3">
             {[
                'Event is cancelled by the organizer.',
                'Event is denied approval after initial ticket sales (rare).',
                'Organizer is declared fraudulent by platform admin.',
                'Venue becomes unavailable or unsafe.',
                'Confirmed safety risks.',
                'Price drop of more than 5% after purchase.'
             ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                     <CheckCircle2 size={18} className="text-emerald-500 min-w-4 h-4" />
                     <span className="text-sm text-neutral-700">{item}</span>
                 </div>
             ))}
        </div>
      </LearnSection>

      <LearnSection title="Event Changes & Eligibility">
        <p className="mb-4">Major changes to an event can make you eligible for a refund outside the standard window.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h4 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand-500"/> Eligible for Refund
                </h4>
                <ul className="text-sm text-neutral-600 space-y-2 list-disc pl-5">
                    <li>Major schedule change (date changed or time shifted by more than 4 hours).</li>
                    <li>Venue relocation (moved to a different city or distant location).</li>
                    <li>Core experience altered (e.g., concert turned into a listening party).</li>
                </ul>
            </div>
            <div>
                <h4 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <XCircle size={16} className="text-neutral-400"/> Not Automatically Eligible
                </h4>
                 <ul className="text-sm text-neutral-600 space-y-2 list-disc pl-5">
                    <li>Minor schedule updates (less than 1 hour).</li>
                    <li>Change of supporting acts/lineup (unless headliner cancels).</li>
                    <li>Personal inability to attend (illness, traffic).</li>
                </ul>
            </div>
        </div>
      </LearnSection>

      <LearnSection title="Partial Refund Protection">
         <p className="mb-4">
            We prevent price exploitation. If ticket prices drop significantly after you purchase:
         </p>
         <ul className="list-disc pl-5 text-neutral-600 mb-6">
            <li>Early buyers may receive <strong>Price Difference Refunds</strong>.</li>
            <li>This is funded directly from the organizer's payout.</li>
         </ul>
      </LearnSection>

      <LearnSection title="Dispute Resolution">
        <p className="mb-4">
            If an organizer refuses a legitimate refund request, the case enters <strong>Platform Review</strong>.
        </p>
        <div className="flex items-center gap-4 p-4 bg-brand-50/50 rounded-xl border border-brand-100">
             <Scale className="text-brand-600 w-6 h-6" />
             <div className="text-sm text-neutral-700">
                <span className="font-bold text-brand-900">Zenvy's Decision is Final.</span> We review evidence from both sides. If we find the organizer non-compliant, we forcibly process the refund from their escrowed funds.
             </div>
        </div>
      </LearnSection>

      <LearnSection title="Processing Times">
         <p className="text-sm text-neutral-500">
            Approved refunds are processed within <strong>3–10 business days</strong> depending on your bank or payment provider (Bkash/Nagad/Card). Zenvy is not responsible for bank-side delays once funds leave our system.
         </p>
      </LearnSection>
    </div>
  );
}
