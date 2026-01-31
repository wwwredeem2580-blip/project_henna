'use client';

import React from 'react';
import { LearnHero } from '@/components/public/learn/LearnHero';
import { LearnSection } from '@/components/public/learn/LearnSection';
import { ShieldCheck, Lock, RefreshCcw, UserCheck, FileCheck } from 'lucide-react';

export default function ProtectsBuyersPage() {
  return (
    <div className="w-full">
      <LearnHero
        title="How zenvy protects buyers"
        subtitle="We've built a platform where freedom meets security. Discover the multi-layered protection system designed to keep your experience safe, authentic, and refundable."
        category="Trust & Safety"
        lastUpdated="January 2026"
      />

      <LearnSection title="The Trust Gap in Event Ticketing">
        <p className="mb-4">
          In the current landscape, event platforms usually fall into two categories: <strong>Self-Hosted</strong> and <strong>Partner-Based</strong>.
        </p>
        <p className="mb-4">
          Self-hosted platforms offer freedom but lack security—anyone can host, leaving you guessing which events are legitimate. Partner-based platforms are safe but slow, with very few events because every organizer must be manually onboarded as a business partner.
        </p>
        <p>
          <strong>Zenvy bridges this gap.</strong> We allow anyone to host, but with a strict, multi-stage verification process. we give hosts the tools to create amazing experiences, but with "constraints" that prevent them from hurting you, the attendee.
        </p>
      </LearnSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
            <UserCheck className="w-7 h-7 text-brand-500 mb-4" />
            <h3 className="text-md font-medium text-neutral-900 mb-2">Verified Identity</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
                Every organizer on Zenvy must bypass a rigorous identity audit. We don't just check emails; we verify legal documents, venue permits, and authenticity proofs before their first event goes live.
            </p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <RefreshCcw className="w-7 h-7 text-emerald-600 mb-4" />
            <h3 className="text-md font-medium text-neutral-900 mb-2">7-Day Refund Guarantee</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
                Changed your mind? You have a standard 7-day refund window for most events. If an event is cancelled, unsafe, or fraudulent, our automated system triggers a 100% refund instantly—no organizer approval needed.
            </p>
        </div>
        <div className="p-6 bg-blue-50 rounded-2xl border border-indigo-100">
            <Lock className="w-7 h-7 text-blue-600 mb-4" />
            <h3 className="text-md font-medium text-neutral-900 mb-2">Locked Ticket Integrity</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
                Once a ticket is sold, the organizer loses the power to manipulate it. They cannot delete the ticket tier, reduce quotas below sold amounts, or secretly downgrade benefits. What you buy is exactly what you get.
            </p>
        </div>
        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <FileCheck className="w-7 h-7 text-indigo-600 mb-4" />
            <h3 className="text-md font-medium text-neutral-900 mb-2">Secure Document Vault</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
                Sensitive verification documents are stored in private, encrypted buckets. Access is restricted to authorized compliance officers via short-lived tokens. Your data privacy is engineered into the core.
            </p>
        </div>
      </div>

      <LearnSection title="Technological Safeguards">
        <ul className="space-y-4 list-disc pl-5 text-neutral-600">
            <li>
                <strong>Short-Lived Access Tokens:</strong> Our authentication system uses 15-minute rotating access tokens. Even if a session is compromised, the window of opportunity is nearly non-existent.
            </li>
            <li>
                <strong>Price Drop Protection:</strong> If an organizer lowers ticket prices after you've bought them (which they can only do with restrictions), eligible early buyers may receive a partial refund for the difference.
            </li>
            <li>
                <strong>Reservation Locking:</strong> When you select a ticket, it's reserved for you during checkout. This prevents "overselling" even during high-traffic viral events.
            </li>
        </ul>
      </LearnSection>
    </div>
  );
}
