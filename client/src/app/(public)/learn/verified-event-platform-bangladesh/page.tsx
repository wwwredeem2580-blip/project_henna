'use client';

import React from 'react';
import { LearnHero } from '@/components/learn/LearnHero';
import { LearnSection } from '@/components/learn/LearnSection';
import { MapPin, Globe, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function VerifiedPlatformPage() {
  return (
    <div className="w-full">
      <LearnHero
        title="Verified event platform in bangladesh"
        subtitle="Why the local event industry needed a rethink. Moving away from chaos towards a standardized, verified, and scalable infrastructure."
        category="Our Mission"
        lastUpdated="January 2026"
      />

      <LearnSection title="The Problem with Current Platforms">
        <p className="mb-6">
            In Bangladesh, the digital ticketing space has historically been fragmented. Platforms like <strong>Tickyfy</strong> or <strong>TixBD</strong> paved the way but often operate on a "Self-Host" model. This means anyone can list an event with minimal oversight. While this offers freedom, it creates a "Wild West" where attendees have to do their own due diligence on every single organizer.
        </p>
        <p className="mb-6">
            On the other end, constrained platforms like <strong>Tickyto</strong> operate on a "Partner-Based" model. You can't just host; you have to be a partner. This ensures quality but severely limits variety. As seen recently, such platforms may have hundreds of users but only a handful of active listings due to this bottleneck.
        </p>
        <div className="p-6 border-l-4 border-brand-500 bg-neutral-50 italic text-neutral-600 my-8">
            "We needed a third way. A platform that scales like an open marketplace but trusts like a closed partner network."
        </div>
      </LearnSection>

      <LearnSection title="The Zenvy Solution: Scalable Verification">
        <p className="mb-6">
            Zenvy introduces a <strong>Hybrid Verification Model</strong>. We are an open platform—anyone can sign up to host. However, visibility is not automatic.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8">
            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-neutral-900">
                    <Globe size={18} className="text-brand-600"/>
                    <span>Open Access</span>
                </div>
                <p className="text-sm">Sign up, draft events, and access the dashboard immediately. No business meetings required to start.</p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-neutral-900">
                    <Users size={18} className="text-brand-600"/>
                    <span>Crowd Safety</span>
                </div>
                <p className="text-sm">Events go live only after document verification. Our admin team reviews every submission for safety and compliance.</p>
            </div>
        </div>
      </LearnSection>

      <LearnSection title="Why This Matters for Bangladesh">
        <p className="mb-4">
            Our local industry is booming with concerts, workshops, and pop-ups. But scams and cancellations are rampant. A verified platform acts as an escrow for trust.
        </p>
        <ul className="space-y-4 list-disc pl-5 text-neutral-600">
            <li><strong>For Organizers:</strong> It separates you from low-quality hosts. Being on Zenvy is a badge of authenticity.</li>
            <li><strong>For Attendees:</strong> It removes the anxiety of "Is this real?". If it's on Zenvy, it's verified.</li>
            <li><strong>For the Industry:</strong> It creates a standardized data layer for events—consistent pricing, reliable stats, and professional handling.</li>
        </ul>
      </LearnSection>

      <div className="mt-12 p-8 bg-neutral-900 rounded-3xl text-center text-neutral-300 space-y-4">
         <TrendingUp className="w-12 h-12 text-brand-500 mx-auto" />
         <h3 className="text-xl text-white font-light">Ready to experience the new standard?</h3>
         <p className="mx-auto text-sm">Join the platform that is defining the future of event management in Bangladesh.</p>
         <div className="pt-4 flex justify-center gap-4">
            <Link href="/events" className="px-6 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">Browse Events</Link>
         </div>
      </div>
    </div>
  );
}
