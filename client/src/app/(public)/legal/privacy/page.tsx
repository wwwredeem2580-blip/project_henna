'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const handleLogin = () => router.push('/auth?tab=login');
  const handleGetStarted = () => router.push('/onboarding');

  return (
    <div className="min-h-screen bg-neutral-0 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Navbar onLogin={handleLogin} onGetStarted={handleGetStarted} />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="space-y-4 mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-light text-neutral-950 tracking-tight">Privacy Policy</h1>
            <p className="text-neutral-500 font-light text-lg">Last updated: February 9, 2026</p>
        </div>

        <div className="prose prose-neutral max-w-none prose-headings:font-light prose-headings:tracking-tight prose-a:text-brand-600 hover:prose-a:text-brand-700">
          <p className="lead text-xl text-neutral-600 font-light">
            At Zenvy ("we," "our," or "us"), we value your privacy and are dedicated to protecting your personal data. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you access or use our platform, website, and services.
          </p>

          <hr className="my-12 border-neutral-200" />

          <h3>1. Information We Collect</h3>
          <p>We collect information that you provide directly to us, such as when you create an account, host an event, purchase a ticket, or contact support.</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, password, and profile details.</li>
            <li><strong>Identity Verification:</strong> Government-issued ID, selfie, and other verification documents for Hosts.</li>
            <li><strong>Payment Information:</strong> Credit card details, billing address, and transaction history (processed securely by our payment partners).</li>
            <li><strong>Event Data:</strong> Information about events you host or attend.</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>We use the collected data to provide, maintain, and improve our services, including:</p>
          <ul>
            <li>Processing ticket purchases and payouts.</li>
            <li>Verifying the identity of event hosts to ensure platform safety.</li>
            <li>Communicating with you about your account, updates, and promotional offers.</li>
            <li>Detecting and preventing fraud, abuse, and security incidents.</li>
          </ul>

          <h3>3. Data Sharing and Disclosure</h3>
          <p>We do not sell your personal data. We may share your information in the following circumstances:</p>
          <ul>
            <li><strong>With Event Organizers:</strong> When you buy a ticket, we share necessary details (Name, Email) with the event organizer for check-in and communication purposes.</li>
            <li><strong>Service Providers:</strong> With third-party vendors who assist with payment processing, data analysis, email delivery, and hosting services.</li>
            <li><strong>Legal Requirements:</strong> If required by law, regulation, or valid legal process.</li>
          </ul>

          <h3>4. Data Retention</h3>
          <p>We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, or as needed to comply with our legal obligations.</p>

          <h3>5. Your Rights</h3>
          <p>Depending on your location, you may have rights regarding your personal data, including:</p>
          <ul>
            <li>Accessing, correcting, or deleting your personal information.</li>
            <li>Objecting to or restricting certain processing of your data.</li>
            <li>Withdrawing consent for marketing communications.</li>
          </ul>

          <h3>6. Security</h3>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.</p>

          <h3>7. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>
            <strong>Zenvy Inc.</strong><br />
            Email: privacy@zenvy.com<br />
            Address: Dhaka, Bangladesh
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
