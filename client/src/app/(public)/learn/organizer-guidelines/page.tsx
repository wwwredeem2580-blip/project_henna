'use client';

import React from 'react';
import { LearnHero } from '@/components/learn/LearnHero';
import { LearnSection } from '@/components/learn/LearnSection';
import { CheckCircle, AlertOctagon, Scale, ShieldAlert } from 'lucide-react';

export default function OrganizerGuidelinesPage() {
  return (
    <div className="w-full">
      <LearnHero
        title="Organizer Guidelines"
        subtitle="The policy framework for hosting on Zenvy. We empower hosts while protecting attendees."
        category="Policy"
        lastUpdated="January 2026"
      />

      <LearnSection title="Organizer Eligibility">
        <p className="mb-4">To maintain our rigorous standards, all organizers must:</p>
        <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Provide valid identity verification (NID/Passport/Business License).</span>
            </li>
            <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Submit authentic event documentation (Venue booking proof, permits).</span>
            </li>
            <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Comply with all local laws and safety regulations.</span>
            </li>
        </ul>
        <div className="p-4 bg-neutral-100 rounded-xl text-sm text-neutral-600">
            <strong>Note:</strong> Zenvy reserves the right to request additional verification at any time. Events involving illegal activity, unsafe conditions, or fraudulent intent are strictly prohibited.
        </div>
      </LearnSection>

      <LearnSection title="Event Accuracy & Transparency">
        <p className="mb-4">
            Misleading your attendees is the fastest way to get banned. You must ensure:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-neutral-100 rounded-xl bg-white">
                <h4 className="font-medium text-neutral-900 text-sm mb-1">Truthful Descriptions</h4>
                <p className="text-xs text-neutral-500">Do not promise guests, performers, or amenities you haven't confirmed.</p>
            </div>
            <div className="p-4 border border-neutral-100 rounded-xl bg-white">
                <h4 className="font-medium text-neutral-900 text-sm mb-1">Accurate Capacity</h4>
                <p className="text-xs text-neutral-500">Ticket sales must not exceed the venue's safe legal limit.</p>
            </div>
             <div className="p-4 border border-neutral-100 rounded-xl bg-white">
                <h4 className="font-medium text-neutral-900 text-sm mb-1">Transparent Pricing</h4>
                <p className="text-xs text-neutral-500">Hidden fees collected at the venue entrance are prohibited unless clearly stated.</p>
            </div>
            <div className="p-4 border border-neutral-100 rounded-xl bg-white">
                <h4 className="font-medium text-neutral-900 text-sm mb-1">Ticket Integrity</h4>
                <p className="text-xs text-neutral-500">Tiers reflect actual benefits. VIP must actually provide VIP services.</p>
            </div>
        </div>
      </LearnSection>

      <LearnSection title="Ticket Integrity Rules">
        <p className="mb-4">Once you have sold a single ticket, your event is locked into a contract with the buyer.</p>
        <ul className="space-y-4 list-disc pl-5 text-neutral-600">
            <li><strong>Constraint:</strong> You cannot reduce ticket quantity below the Sold + Reserved count.</li>
            <li><strong>Constraint:</strong> You cannot delete a ticket tier that has active sales.</li>
            <li><strong>Price Protection:</strong> Significant price reductions may trigger partial refunds to early buyers (funded from your payout) to prevent price gouging.</li>
        </ul>
      </LearnSection>

      <LearnSection title="Communication & Payouts">
        <h3 className="text-lg font-medium text-neutral-900 mb-2 mt-4">Communication</h3>
        <p className="mb-4 text-sm text-neutral-600">organizers must respond to attendee concerns and cooperate with dispute resolution. Ignoring disputes decreases your "Trust Score".</p>

        <h3 className="text-lg font-medium text-neutral-900 mb-2 mt-4">Payout Conditions</h3>
        <ul className="space-y-2 text-sm text-neutral-600 list-disc pl-5">
            <li>Payouts are generated automatically by our cron workers.</li>
            <li>Funds are typically released <strong>after event completion</strong> (usually 24-48 hours post-event).</li>
            <li>Payouts are subject to a dispute window and may be adjusted for refunds or violations.</li>
            <li>Zenvy may hold payouts during active investigations.</li>
        </ul>
      </LearnSection>

      <LearnSection title="Prohibited Activities">
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-rose-800 font-medium mb-4">
                <ShieldAlert size={20} />
                <span>Zero Tolerance Policy</span>
            </div>
            <p className="text-sm text-rose-900/80 mb-4">The following will lead to immediate permanent bans:</p>
            <ul className="space-y-2 list-disc pl-5 text-sm text-rose-900/80">
                <li>Selling fake or duplicate tickets.</li>
                <li>Overselling venue capacity intentionally.</li>
                <li>Financial abuse or money laundering.</li>
                <li>Manipulating the refund system.</li>
                <li>Using the platform for scams.</li>
            </ul>
        </div>
      </LearnSection>
    </div>
  );
}
