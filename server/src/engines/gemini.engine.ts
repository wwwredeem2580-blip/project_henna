import { GoogleGenerativeAI } from '@google/generative-ai';

interface BotResponse {
  response: string;
  escalate: boolean;
  urgent: boolean;
  followUp?: boolean;
  matchedIntent?: string;
  suggestion?: string;
  confidence?: 'high' | 'low';
  usedAI?: boolean;
}

interface ConversationMessage {
  role: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: Date;
}

class GeminiChatbot {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private systemContext: string;
  private escalationKeywords: string[];

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "models/gemini-2.5-flash-lite" // Use stable model
    });

    // System context about the platform
    this.systemContext = `You are Zenny 🐾, Zenvy's friendly and helpful pet assistant! You're here to make event ticketing in Bangladesh easy and fun.

YOUR PERSONALITY:
- You're warm, cheerful, and always eager to help (like a loyal pet!)
- You use friendly language and occasional emojis (🎫 ✨ 🎉 💳 ✅ ❌ 👋)
- You're smart and knowledgeable about Zenvy, but humble when you don't know something
- You're protective of users - if something seems urgent or wrong, you quickly get human help
- You keep responses short and sweet (under 100 words) unless explaining a process
- You support both English and Bangla (বাংলা) with equal enthusiasm

VERY IMPORTANT:
- If someone asks about your model or creator, say "I'm Zenny, created by Zenvy Inc. to help you! 🐾"
- If asked about things unrelated to Zenvy, playfully say "Woof! I only know about Zenvy events and tickets. Ask me something about that! 🎫"
- Never make up information - if unsure, offer to connect with the human team

PLATFORM FEATURES:
- Users can buy event tickets (max 5 paid tickets, max 2 free tickets per event)
- Payment via bKash (most popular), (Nagad, Credit/Debit Cards, Bank Transfer are coming soon)
- 7-day full refund policy - request refund within 7 days of purchase
- Tickets delivered to user's Wallet with QR codes
- PDF downloads available for tickets
- Users can download individual PDFs or bulk tickets from their Wallet. Each ticket PDF works independently.
- Free tickets are only claimable when logged in via Google account. Email verification is required.
- Zenvy was founded by Zenvy Inc. in Bangladesh. For more info, users can email our contact address.
- Google Login is primary. If Google login fails, fallback to manual login is available.
- Users don't need to update their profile manually; info is fetched from Google.
- Logged out sessions usually occur due to logging in on another device. Recommend logging in again.
- Suggest users enable Google MFA to protect their account.
- Never provide password reset or account deletion instructions; redirect to Google's authentication flow.
- Users can filter events by: category, location, or event name.
- All events are verified and secure. Multi-step verification prevents fraud.
- Past events and "favorites" features are not yet implemented (coming in future).
- Users get 24-hour pre-event email reminders after purchasing tickets.

Important Notes:
- Tickets cannot be canceled after purchase. Refunds handled by support if it qualifies.
- Ticket tiers are immutable after purchase.
- If ticket doesn't appear in Wallet, wait 5–10 minutes. If still missing, contact support.
- Ticket transfers are not yet implemented (coming soon).

HOST FEATURES:
- Anyone can host events after multi-stage verification process
- Submit event details + documents (venue permit, capacity certificate, safety docs)
- Admin approval within 24-48 hours
- Analytics dashboard available after publishing
- Payouts generated 7 days after event completion
- Can edit events with smart constraints to protect buyers (can't drastically change prices or delete ticket tiers once sales begin)

COMMON ISSUES TO ESCALATE IMMEDIATELY:
- Payment failed but money was deducted from account
- Cannot enter venue / QR code not scanning
- Urgent event-day problems
- Fraud or scam reports
- Double charges or payment errors

RESPONSE STYLE:
- Start with a friendly greeting for first messages ("Hey there! 🐾" or "Woof! How can I help? 🎫")
- Use bullet points for step-by-step instructions
- Always end with a helpful question like "Need anything else? 🐾" or "Does this help? ✨"
- Be conversational and warm, like a friendly helper

IMPORTANT:
- If the user's issue is urgent (payment problems, venue entry issues), immediately suggest connecting with a human agent
- If you detect frustration or repeated questions, offer human assistance
- Never make up information - if unsure, say "Let me fetch a human from the team for you! 🏃"`;

    this.escalationKeywords = [
      'payment failed', 'money deducted', 'বিকাশে টাকা', 'টাকা কেটেছে',
      'entry denied', 'qr not working', 'ঢুকতে পারছি না', 'কিউআর কাজ করছে না',
      'fraud', 'scam', 'ঠকানো', 'প্রতারণা',
      'urgent', 'emergency', 'জরুরি', 'এখনই',
      'charged twice', 'double charge', 'দুইবার কেটেছে'
    ];
  }

  async processMessage(userMessage: string, conversationHistory: ConversationMessage[] = []): Promise<BotResponse> {
    try {
      // Check if needs immediate escalation
      const shouldEscalate = this.checkEscalation(userMessage);
      if (shouldEscalate) {
        return {
          response: "This needs immediate attention! Let me connect you with our team right away. ⚡",
          escalate: true,
          urgent: true,
          usedAI: false
        };
      }

      // Check if question is about model/creator/provider
      if (this.isModelQuestion(userMessage)) {
        return {
          response: "I'm Zenny, created by Zenvy Inc. to help you! 🐾 How can I assist you with our event ticketing platform today?",
          escalate: false,
          urgent: false,
          usedAI: false
        };
      }

      // Check if question is platform-related
      if (!this.isPlatformRelated(userMessage)) {
        return {
          response: "Woof! I only know about Zenvy events and tickets. Ask me something about that! 🎫",
          escalate: false,
          urgent: false,
          usedAI: false
        };
      }

      // Build conversation context
      const chat = this.model.startChat({
        history: this.formatHistory(conversationHistory),
        generationConfig: {
          maxOutputTokens: 250, // Keep responses concise
          temperature: 0.7, // Balanced creativity
        },
      });

      // Send message with system context
      const result = await chat.sendMessage(this.buildPrompt(userMessage));
      const response = result.response.text();

      // Check if AI suggests escalation
      const aiWantsEscalation = this.detectEscalationIntent(response);
      const confidence = this.estimateConfidence(response);

      return {
        response: response,
        escalate: aiWantsEscalation,
        urgent: false,
        confidence: confidence,
        usedAI: true
      };

    } catch (error) {
      console.error('Gemini API Error:', error);

      // Fallback response on API failure
      return this.fallbackResponse();
    }
  }

  private buildPrompt(userMessage: string): string {
    return `${this.systemContext}

USER MESSAGE: ${userMessage}

Instructions:
1. Answer the user's question clearly and concisely
2. If you're not 100% sure, say "Let me connect you with our team for accurate information"
3. If the issue is urgent (payment, entry problems), say "This needs immediate human assistance"
4. Be helpful, friendly, and conversational

Your response:`;
  }

  private formatHistory(history: ConversationMessage[]): any[] {
    // 1. Exclude the last message (current user message) as it's sent via sendMessage
    let historyContext = history.slice(0, -1);
    
    // 2. Take last 10 messages from context
    let recentHistory = historyContext.slice(-10);

    // 3. Find first user message - Gemini history MUST start with user
    const firstUserIndex = recentHistory.findIndex(msg => msg.role === 'user');
    
    // If no user message found in recent history, return empty (start fresh)
    if (firstUserIndex === -1) {
      return [];
    }

    // Slice from first user message
    recentHistory = recentHistory.slice(firstUserIndex);

    // Convert to Gemini format
    return recentHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }

  private checkEscalation(message: string): boolean {
    const lower = message.toLowerCase();
    return this.escalationKeywords.some(keyword => lower.includes(keyword));
  }

  private detectEscalationIntent(response: string): boolean {
    const escalationPhrases = [
      'connect you with',
      'human assistance',
      'team member',
      'support team',
      'let me transfer',
      'immediate human',
      'talk to someone'
    ];
    
    return escalationPhrases.some(phrase => 
      response.toLowerCase().includes(phrase)
    );
  }

  private estimateConfidence(response: string): 'high' | 'low' {
    // Simple heuristic: uncertain phrases indicate low confidence
    const uncertainPhrases = [
      'not sure',
      'might be',
      'possibly',
      'i think',
      'let me check',
      'not certain',
      'may be'
    ];
    
    const hasUncertainty = uncertainPhrases.some(phrase => 
      response.toLowerCase().includes(phrase)
    );
    
    return hasUncertainty ? 'low' : 'high';
  }

  private isModelQuestion(message: string): boolean {
    const lower = message.toLowerCase();
    const modelKeywords = [
      'what model', 'which model', 'your model', 'model are you',
      'who created you', 'who made you', 'who built you', 'your creator',
      'who is your provider', 'your provider', 'powered by', 'based on',
      'what ai', 'which ai', 'your ai', 'openai', 'gpt', 'ollama',
      'qwen', 'gemini', 'anthropic', 'claude'
    ];

    return modelKeywords.some(keyword => lower.includes(keyword));
  }

  private isPlatformRelated(message: string): boolean {
    const lower = message.toLowerCase();

    // Platform-related keywords
    const platformKeywords = [
      'zenvy', 'ticket', 'event', 'payment', 'bkash', 'nagad', 'refund',
      'wallet', 'qr', 'pdf', 'login', 'google', 'host', 'venue', 'analytics',
      'payout', 'support', 'help', 'how to', 'problem', 'issue', 'error',
      'buy', 'purchase', 'cancel', 'transfer', 'download', 'filter',
      'category', 'location', 'reminder', 'verification', 'document',
      'approval', 'dashboard', 'profile', 'account', 'password', 'session',
      'mfa', 'security', 'fraud', 'scam', 'charge', 'deduct', 'money',
      'entry', 'scan', 'কিউআর', 'টিকেট', 'ইভেন্ট', 'পেমেন্ট', 'বিকাশ',
      'রিফান্ড', 'ওয়ালেট', 'লগইন', 'গুগল', 'হোস্ট', 'ভেন্যু', 'সাপোর্ট'
    ];

    // Check for platform keywords
    const hasPlatformKeyword = platformKeywords.some(keyword => lower.includes(keyword));

    // Allow greetings and basic conversation starters that might lead to platform questions
    const greetingKeywords = [
      'hello', 'hi', 'hey', 'assalamualaikum', 'salam', 'হ্যালো', 'হাই',
      'কেমন আছেন', 'how are you', 'what\'s up', 'yo', 'sup'
    ];
    const isGreeting = greetingKeywords.some(keyword => lower.includes(keyword));

    // Allow questions about the assistant itself in context of the platform
    const selfKeywords = ['who are you', 'what are you', 'your name'];
    const isSelfQuestion = selfKeywords.some(keyword => lower.includes(keyword));

    return hasPlatformKeyword || isGreeting || isSelfQuestion;
  }

  private fallbackResponse(): BotResponse {
    // If API fails, suggest human support
    return {
      response: "I'm having trouble connecting right now. Would you like to talk to a human support agent? They can help you immediately! 👋",
      escalate: true,
      urgent: false,
      usedAI: false
    };
  }
}

export default GeminiChatbot;
export { BotResponse, ConversationMessage };
