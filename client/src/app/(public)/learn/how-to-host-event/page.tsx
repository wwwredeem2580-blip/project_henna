'use client';

import React from 'react';
import { LearnHero } from '@/components/public/learn/LearnHero';
import { LearnSection } from '@/components/public/learn/LearnSection';
import { PenTool, CheckSquare, BarChart, Settings, UploadCloud } from 'lucide-react';

export default function HowToHostPage() {
  return (
    <div className="">
      <LearnHero
        title="How to Host an Event"
        subtitle="A step-by-step guide to using Zenvy's powerful event builder. From draft to sold out."
        category="Organizer Guide"
        lastUpdated="January 2026"
      />

      <LearnSection title="1. Create & Draft">
        <div className="flex gap-4 mb-6">
          <div>
            <h3 className="text-lg font-[400] text-neutral-900 mb-2">Build your Event</h3>
            <p className="text-neutral-600 mb-2">Use the "Create Event" wizard to set up your basic details: Title, Schedule, and Venue.</p>
            <div className="text-sm p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center gap-2">
                <PenTool size={16} className="text-brand-600"/>
                <span>You can save as <strong>Draft</strong> at any stage and come back later.</span>
            </div>
          </div>
        </div>
      </LearnSection>

      <LearnSection title="2. Verification & Submission">
           <div className="flex gap-4 mb-6">
             <div>
                <h3 className="text-lg font-[400] text-neutral-900 mb-2">Required Documents</h3>
                <p className="text-neutral-600 mb-4">Before publishing, you must upload verification proofs:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <li className="flex items-center gap-2 text-sm text-neutral-700 bg-white p-2 border rounded-md"><CheckSquare size={14} className="text-green-500"/> IDENTITY PROOF (NID)</li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 bg-white p-2 border rounded-md"><CheckSquare size={14} className="text-green-500"/> VENUE BOOKING</li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 bg-white p-2 border rounded-md"><CheckSquare size={14} className="text-green-500"/> SAFETY PLAN</li>
                </ul>
                <p className="text-xs text-neutral-500 italic">*Documents are stored in our secure private vault and used only for verification.</p>
             </div>
        </div>
      </LearnSection>

      <LearnSection title="3. Publishing & Management">
           <div className="flex gap-4 mb-6">
             <div>
                <h3 className="text-lg font-[400] text-neutral-900 mb-2">The Dashboard</h3>
                <p className="text-neutral-600 mb-4">Once approved and published, the full power of the dashboard unlocks:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-neutral-900 text-sm">
                            <BarChart size={16} className="text-brand-600"/> Analytics
                        </div>
                        <p className="text-xs text-neutral-500">Track revenue, page views, and conversion rates in real-time.</p>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-neutral-900 text-sm">
                            <UploadCloud size={16} className="text-brand-600"/> Gallery Management
                        </div>
                        <p className="text-xs text-neutral-500">Update event cover images and gallery to keep the page fresh.</p>
                    </div>
                </div>
             </div>
        </div>
      </LearnSection>

      <LearnSection title="Freedom with Constraints">
        <p className="mb-4">
            We give you power, but we prevent accidents.
        </p>
        <div className="space-y-4">
            <div className="p-4 bg-brand-50 border-l-4 border-brand-500 rounded-r-xl">
                <h4 className="font-medium text-brand-900 text-sm mb-1">Editing Logic</h4>
                <p className="text-xs text-brand-800">
                    If you have <strong>0 sales</strong>, you can edit almost anything.
                    <br/>
                    If you have <strong>1+ sales</strong>, critical fields (Time, Ticket Prices, Benefits) become locked or restricted to prevent misleading early buyers.
                </p>
            </div>
             <div className="p-4 bg-neutral-50 border-l-4 border-neutral-500 rounded-r-xl">
                 <h4 className="font-medium text-neutral-900 text-sm mb-1">Schedule Changes</h4>
                 <p className="text-xs text-neutral-700">
                    You can modify the schedule by <strong>±2 hours max</strong> (one time only) after publishing. Larger changes require Admin approval and attendee notification.
                </p>
            </div>
        </div>
      </LearnSection>

      <LearnSection title="Ready for Event Day?">
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-brand-900 mb-2">Host Operational Guide</h3>
                <p className="text-brand-800 text-sm mb-4">
                    Once your event is published, use our interactive checklist to manage everything from scanner setup to entry staff.
                </p>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-brand-600 border border-brand-100">Step-by-step</span>
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-brand-600 border border-brand-100">Interactive</span>
                </div>
            </div>
            <a 
                href="/learn/host-guide" 
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-brand-200"
            >
                Open Host Guide
            </a>
        </div>
      </LearnSection>
    </div>
  );
}
