interface Pattern {
  patterns: RegExp[];
  responses: string[];
  escalate?: boolean;
  urgent?: boolean;
  followUp?: boolean;
}

interface BotResponse {
  response: string;
  escalate: boolean;
  urgent: boolean;
  followUp: boolean;
  matchedIntent?: string;
  suggestion?: string;
}

interface ConversationMessage {
  role: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: Date;
}

class ChatbotEngine {
  private patterns: Record<string, Pattern>;
  private escalationKeywords: RegExp[];

  constructor() {
    this.patterns = {
      // Greetings
      greeting: {
        patterns: [
          /\b(hi|hello|hey|greetings|salam|assalamualaikum)\b/i,
          /\b(good\s*(morning|evening|afternoon))\b/i
        ],
        responses: [
          "Hello! 👋 Welcome to Zenvy. How can I help you today?",
          "Hi there! I'm your virtual assistant. Ask me anything about events, tickets, or hosting!",
          "Assalamualaikum! How may I assist you with our platform today?"
        ]
      },

      // Platform Info (Vision & Model)
      platformInfo: {
        patterns: [
          /what.*platform/i,
          /what.*zenvy/i,
          /\b(about\s*(us|platform|company|zenvy))\b/i,
          /\b(who\s*are\s*you)\b/i,
          /\b(how.*work)\b/i,
          /\b(tell.*about)\b/i
        ],
        responses: [
          "We are a next-gen event platform that bridges the gap between self-hosted freedom and verified security. \n\nUnlike others, we allow ANYONE to host events (just like self-hosted models) but with a twist: our Multi-Stage Verification system ensures every event is legitimate. \n\nHosts get powerful tools to manage events, but with smart constraints to protect YOU, the attendee. Best of both worlds! 🌟"
        ],
        followUp: true
      },

      // Hosting Model (Self-host with constraints)
      hostingModel: {
        patterns: [
          /\b(host\s*model)\b/i,
          /\b(can\s*i\s*host)\b/i,
          /\b(create\s*event)\b/i,
          /\b(hosting\s*rules)\b/i
        ],
        responses: [
          "Yes, you can host! 🎤 Our model is unique:\n\n1. **Freedom**: Anyone can draft and create events.\n2. **Verification**: You submit documents (venue permit, capacity) for admin review.\n3. **Publishing**: Once approved, you go live!\n4. **Constraints**: To protect buyers, you can't drastically change prices or delete ticket tiers once sales begin.\n\nWant to start hosting today? Check your dashboard!"
        ],
        followUp: true
      },

      // Safety & Security
      safety: {
        patterns: [
          /^safe(ty)?$/i,
          /\b(safe|safety)\b/i,
          /\b(is\s*it\s*safe)\b/i,
          /\b(secure|security)\b/i,
          /\b(scam|fraud)\b/i,
          /\b(fake\s*event)\b/i,
          /\b(verify|verification|verified)\b/i,
          /\b(trust)\b/i
        ],
        responses: [
          "Safety is our #1 priority! 🛡️\n\n• **Verified Hosts**: Every event goes through a rigorous Multi-Stage Verification process.\n• **Secure Docs**: Verification documents are stored in a private, encrypted vault (Backblaze B2) accessible only to admins.\n• **No Scams**: We hold payouts until the event is successfully completed.\n\nYou're in safe hands here."
        ]
      },

      // Refund Policy (7-day rule)
      refund: {
        patterns: [
          /\b(refund)\b/i,
          /\b(money\s*back)\b/i,
          /\b(cancel\s*ticket)\b/i,
          /\b(return\s*money)\b/i
        ],
        responses: [
          "We offer a simplified **7-Day Refund Policy**: \n\n✅ You can request a full refund within 7 days of purchase.\n✅ If an event is cancelled, you get 100% money back automatically.\n✅ Refunds are processed back to your bKash/wallet within 3-5 business days.\n\nNeed to request one now?"
        ],
        followUp: true
      },

      // Ticket Purchase
      ticketPurchase: {
        patterns: [
          /^tickets?$/i,
          /\b(buy|purchase|get).*ticket/i,
          /\b(how.*purchase)\b/i,
          /\b(how.*buy)\b/i,
          /\b(ticket.*price)\b/i,
          /\b(free.*ticket)\b/i,
          /\b(claim.*free)\b/i,
          /\b(transfer.*ticket)\b/i,
          /\b(cancel.*order)\b/i
        ],
        responses: [
          "Buying is easy! \n1. Browse events & select your favorite.\n2. Choose your ticket tier (Regular, VIP, etc.).\n3. Customize your quantity (max 5 per user).\n4. Pay securely via bKash.\n\n🎉 Your tickets will appear instantly in your **Wallet** with a beautiful custom invitation card!"
        ],
        followUp: true
      },

      // Wallet & Features
      walletFeatures: {
        patterns: [
          /^wallet$/i,
          /\b(wallet)\b/i,
          /\b(my\s*ticket)\b/i,
          /\b(find.*ticket)\b/i,
          /\b(where.*ticket)\b/i,
          /\b(download)\b/i,
          /\b(print)\b/i,
          /\b(pdf)\b/i,
          /\b(qr\s*code)\b/i,
          /\b(missing.*ticket)\b/i,
          /\b(not.*showing)\b/i
        ],
        responses: [
          "Your Wallet is your event passport! 🎫\n\n• View beautifully designed ticket cards.\n• Download tickets as PDF or QR code.\n• Bulk download all event tickets as a ZIP.\n• Even claim free tickets (up to 2/event) after email verification!\n\nCheck your Wallet tab to see them."
        ]
      },

      // Tech Stack (Easter Egg)
      techStack: {
        patterns: [
          /\b(tech\s*stack)\b/i,
          /\b(how\s*is\s*it\s*built)\b/i,
          /\b(developer)\b/i,
          /\b(technolog(y|ies))\b/i
        ],
        responses: [
          "Glad you asked, fellow dev! 👨‍💻\n\nThis platform is engineered with:\n• **Frontend**: Next.js (SSR/Server Actions)\n• **Backend**: Microservices-ready Modular Monolith\n• **DB**: MongoDB (Complex Aggregations) + Redis (Caching)\n• **Queue**: BullMQ for email workers\n• **Storage**: ImageKit (CDN) + Backblaze B2 (Secure Docs)\n• **Realtime**: Socket.io through API Gateway\n\nBuilt for scale and performance! 🚀"
        ]
      },

      // Payment Issues (Escalation)
      paymentIssue: {
        patterns: [
          /\b(payment\s*failed)\b/i,
          /\b(money\s*deducted)\b/i,
          /\b(bkash\s*error)\b/i,
          /\b(transaction\s*id)\b/i
        ],
        responses: [
          "I'm sorry you're facing payment trouble. This shouldn't happen. Let me connect you with a human agent immediately to track your transaction."
        ],
        escalate: true,
        urgent: true
      },

      // Talk to Human
      talkToHuman: {
        patterns: [
          /\b(talk\s*to\s*human)\b/i,
          /\b(customer\s*(service|support))\b/i,
          /\b(agent)\b/i,
          /\b(real\s*person)\b/i
        ],
        responses: [
          "Understood. Connecting you to our support team now..."
        ],
        escalate: true
      }
    };

    this.escalationKeywords = [
      /\b(urgent)\b/i,
      /\b(emergency)\b/i,
      /\b(stuck)\b/i,
      /\b(fraud)\b/i,
      /\b(scam)\b/i,
      /\b(police)\b/i,
      /\b(legal)\b/i,
      /\b(sue)\b/i
    ];
  }

  // Main processing method
  processMessage(message: string, conversationHistory: ConversationMessage[] = []): BotResponse {
    const trimmedMessage = message.trim();

    // Check for escalation keywords
    if (this.shouldEscalate(trimmedMessage, conversationHistory)) {
      return {
        response: "I detect this is urgent. I'm escalating this conversation to a human specialist right now. Please hold on.",
        escalate: true,
        urgent: true,
        followUp: false
      };
    }

    // Find matching pattern
    for (const [key, config] of Object.entries(this.patterns)) {
      if (this.matchesPattern(trimmedMessage, config.patterns)) {
        const response = this.getRandomResponse(config.responses);
        
        return {
          response,
          escalate: config.escalate || false,
          urgent: config.urgent || false,
          followUp: config.followUp || false,
          matchedIntent: key
        };
      }
    }

    // No pattern matched
    return this.handleUnknown(trimmedMessage);
  }

  private matchesPattern(message: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(message));
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private shouldEscalate(message: string, history: ConversationMessage[]): boolean {
    // Check frustration (3+ messages without resolution)
    if (history.length >= 3) {
      const lastThree = history.slice(-3);
      const hasNoHelpfulResponse = lastThree.every(msg => 
        msg.role === 'user' && msg.text.length < 50
      );
      if (hasNoHelpfulResponse) return true;
    }

    // Check escalation keywords
    return this.escalationKeywords.some(pattern => pattern.test(message));
  }

  private handleUnknown(message: string): BotResponse {
    // Try to be helpful even when uncertain
    if (message.includes('?')) {
      return {
        response: "That's a good question! I'm not 100% sure, but I can tell you about our **Refund Policy**, **Hosting Rules**, or connect you with an Agent. Which would you prefer?",
        escalate: false,
        followUp: true,
        urgent: false,
        suggestion: "Talk to Agent"
      };
    }

    return {
      response: "I'm your Project Pinecone assistant! 🌲\n\nI can help you with:\n• **Hosting Events** (Community Model)\n• **Ticket Refunds** (7-Day Policy)\n• **Safety & Verification**\n• **Wallet & Downloads**\n\nWhat's on your mind?",
      escalate: false,
      urgent: false,
      followUp: false
    };
  }

  // Bangla detection (Simple char range check)
  detectLanguage(message: string): 'bn' | 'en' {
    const banglaPattern = /[\u0980-\u09FF]/;
    return banglaPattern.test(message) ? 'bn' : 'en';
  }
}

export default ChatbotEngine;
export { BotResponse, ConversationMessage };
