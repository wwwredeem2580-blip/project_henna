'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();
  const handleLogin = () => router.push('/auth?tab=login');
  const handleGetStarted = () => router.push('/onboarding');

  return (
    <div className="min-h-screen bg-neutral-0 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Navbar onLogin={handleLogin} onGetStarted={handleGetStarted} />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="space-y-4 mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-light text-neutral-950 tracking-tight">Terms of Service</h1>
            <p className="text-neutral-500 font-light text-lg">Effective Date: February 9, 2026</p>
        </div>

        <div className="prose prose-neutral max-w-none prose-headings:font-light prose-headings:tracking-tight prose-a:text-brand-600 hover:prose-a:text-brand-700">
          <p className="lead text-xl text-neutral-600 font-light">
            Welcome to Zenvy! These Terms of Service ("Terms") outline the rules and regulations for using the Zenvy website and platform. By accessing Zenvy, you agree to be bound by these Terms. If you disagree with any part of these terms, please do not use our services.
          </p>

          <hr className="my-12 border-neutral-200" />

          <h3>1. Acceptance of Terms</h3>
          <p>By registering for an account, hosting an event, or purchasing a ticket through Zenvy, you agree to comply with these Terms and our Privacy Policy.</p>

          <h3>2. Account Registration</h3>
          <ul>
            <li>You must be at least 18 years old to use Zenvy.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>We reserve the right to suspend or terminate accounts that violate our community guidelines or terms.</li>
          </ul>

          <h3>3. Hosting Events</h3>
          <p>As an Event Host, you agree that:</p>
          <ul>
            <li>You are solely responsible for the event you organize, including safety, legality, and execution.</li>
            <li>You will provide accurate event descriptions and ticketing information.</li>
            <li>You will comply with all applicable laws and regulations in your jurisdiction.</li>
            <li>Zenvy is not liable for any issues arising from your event (cancellations, accidents, etc.), except for platform-related technical failures.</li>
          </ul>

          <h3>4. Ticket Purchases</h3>
          <p>As an Attendee, you agree that:</p>
          <ul>
            <li>Tickets purchased are generally non-refundable unless the event is cancelled or as specified by the event organizer's refund policy.</li>
            <li>Zenvy acts as a ticketing agent and is not the organizer of the events listed on the platform.</li>
            <li>We may charge a service fee for ticket processing, which is non-refundable.</li>
          </ul>

          <h3>5. Prohibited Conduct</h3>
          <p>You agree not to use the platform for:</p>
          <ul>
            <li>Posting false, misleading, or fraudulent content.</li>
            <li>Selling tickets to illegal events or prohibited items.</li>
            <li>Interfering with the security or proper functioning of the site.</li>
            <li>Harassing other users or violating their privacy.</li>
          </ul>

          <h3>6. Intellectual Property</h3>
          <p>All content, trademarks, and data on Zenvy (excluding user-generated content) are the property of Zenvy Inc. and are protected by intellectual property laws. You may not reproduce or distribute any content without our permission.</p>

          <h3>7. Limitation of Liability</h3>
          <p>To the maximum extent permitted by law, Zenvy shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.</p>

          <h3>8. Governing Law</h3>
          <p>These Terms are governed by the laws of Bangladesh. Any disputes arising from these Terms will be resolved in the courts of Dhaka, Bangladesh.</p>

          <h3>9. Changes to Terms</h3>
          <p>We may update these Terms from time to time. We will notify you of any significant changes by posting the new Terms on this page.</p>

          <h3>10. Contact Us</h3>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>
            <strong>Zenvy Inc.</strong><br />
            Email: legal@zenvy.com
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
