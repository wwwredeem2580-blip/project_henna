# 🌟 Zenvy: The Professional Event Ticketing Guardian

Zenvy is a high-performance, AI-integrated event ticketing platform designed for secure, transparent, and seamless event management.

## 🚀 Key Features (A to Z)

- **A**dmin Dashboard & Control Center: Centralized management for users, events, and support escalations.
- **A**I-Powered Support Agent (Zenny): Intelligent chatbot with RAG (Retrieval-Augmented Generation) capability.
- **A**nalytics for Hosts: Real-time insights into revenue, page views, and ticket conversion rates.
- **A**uthentication: Secure Google OAuth integration for seamless user access.
- **B**angladesh-Specific Compliance: Built-in support for NID verification, Police NOC, and local permits.
- **B**atch Ticket Generation: Automatic creation of PDF tickets with unique, secure QR codes.
- **C**heckout & Payment Processing: Frictionless ticket purchasing flow with secure payment state management.
- **D**ashboard for Organizers: Dedicated space for hosts to create events, manage sales, and track payouts.
- **D**ocument Management Vault: Encrypted storage for organizer identity and venue safety permits.
- **E**mail Verification System: Automated flows for claim verification and ticket delivery.
- **E**vent Verification (Verified Badge): Multi-stage approval process to ensure attendee safety and trust.
- **F**ree Ticket Quota Management: Anti-abuse system enforcing monthly limits (e.g., 10 free tickets/month).
- **G**uidebook First Protocol: AI-driven "self-help" support that prioritizes education over immediate escalation.
- **H**ost Onboarding: Streamlined wizard for verifying organizers and their business credentials.
- **H**ybrid AI Engine: Dual-layered AI processing using Google Gemini and local Ollama (Llama 3.1).
- **I**ntelligent Escalation System: Automated sentiment analysis that routes complex issues to human agents.
- **L**ive Support Chat: Real-time WebSocket-based communication between users and administrators.
- **M**edia Gallery: Integrated system for high-resolution event imagery and promotional content.
- **M**ulti-Tier Ticketing: Support for VIP, General, Early Bird, and Free ticket categories.
- **O**rder Tracking: Complete purchase history and ticket management for attendees.
- **P**ayout Automation: Scheduled generation of host payouts with dispute-window safeguards.
- **P**olicies Engine: Standardized enforcement of refund windows (7-day rule) and cancellation terms.
- **Q**R Code Secure Entry: Industry-standard verification system for venue access control.
- **R**eal-time Event Status: Instant updates on ticket availability, sold-out tiers, and venue changes.
- **R**efund Eligibility Checker: Automated logic to calculate eligibility based on purchase time and event date.
- **S**ituational Awareness Engine: AI logic that adapts responses based on user urgency and frustration levels.
- **S**upport Queue Management: Dedicated admin interface for handling escalated support tickets in real-time.
- **T**icket Limit Enforcement: Anti-scalping protection limiting tickets per user per event.
- **U**ser Profile Management: Centralized control for account preferences and event interests.
- **V**enue Permit Validation: Automated checks for fire safety clearances and capacity certificates.
- **W**allet (Digital Ticket Storage): A secure, mobile-friendly space for attendees to download and manage tickets.
- **Z**enny Chatbot: The professional platform guardian that handles edge cases and guides users locally.

---

## 📖 Extra Documentation

- [Ticket Verification API Guide](./TICKET_VERIFICATION_GUIDE.md) — A beginner-friendly guide for scanner integration.

---

## 🛠️ Infrastructure & Tech Stack

- **Frontend**: Next.js, TypeScript, Vanilla CSS (Refined UI), Framer Motion.
- **Backend**: Node.js, Express, TypeScript, WebSocket (Socket.io).
- **Database**: MongoDB (Primary), Redis (Caching), ChromaDB (Vector Store for AI).
- **AI Engine**: Google Gemini Pro, Ollama (Llama 3.1:8b).
- **Infrastructure**: Docker Compose (Multi-container setup), NGINX (Reverse Proxy).

## 🔧 Getting Started

### Development (Local)
```bash
docker compose -f docker-compose.dev.yaml up -d
```

### Production (VPS)
```bash
docker compose -f docker-compose.prod.yaml up -d
```

---
*Built with ❤️ by Zenvy Inc.*
