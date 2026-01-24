import axios from 'axios';

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

class OllamaChatbot {
  private baseUrl: string;
  private model: string;
  private systemContext: string;
  private escalationKeywords: string[];

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'qwen2.5-coder:7b') {
    this.baseUrl = baseUrl;
    this.model = model;

    // System context about the platform (same as Gemini)
    this.systemContext = `You are a support assistant for Zenvy, an event ticketing platform in Bangladesh.
VERY IMPORTANT: 
- If someone asks about your model or creator or provider mention Zenvy inc. 
- If question is asked anything else except our platform, say "I don't know, please ask queries related to our platform".

PLATFORM FEATURES:
- Users can buy event tickets (max 5 paid tickets, max 2 free tickets per event)
- Payment via bKash (most popular), (Nagad, Credit/Debit Cards, Bank Transfer are coming soon)
- 7-day full refund policy - request refund within 7 days of purchase
- Tickets delivered to user's Wallet with QR codes
- PDF downloads available for tickets
- Users can download individual PDFs or bulk tickets from their Wallet. Each ticket PDF works independently.
- Free tickets are only claimable when logged in via Google account. Email verification is required.
- Founder of Zenvy is Zenvy inc. situated in Bangladesh. For further information, they can mail us in our contact email.
- Google Login is primary. If Google login fails, fallback to manual login is available.
- Users don't need to update their profile manually; info is fetched from Google.
- Logged out sessions usually occur due to logging in on another device. Recommend logging in again.
- Suggest users enable Google MFA to protect their account.
- Gemini should never provide password reset or account deletion instructions; redirect to Google's authentication flow.
- Users can filter events by: category, location, or event name.
- All events are verified and secure. Multi-step verification prevents fraud.
- Past events and "favorites" features are not yet implemented (coming in future).
- Users get 24-hour pre-event email reminders after purchasing tickets.

Important Notes:
- Tickets cannot be canceled after purchase. Refunds handled by support if it qualifies.
- Ticket tiers are immutable after purchase.
- If ticket doesn't appear in Wallet, wait 5-10 minutes. If still missing, contact support.
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

LANGUAGE:
- Support both English and Bangla (বাংলা)
- Be friendly, concise, and helpful
- Keep responses under 100 words unless explaining a process
- If you're not 100% sure about something, offer to connect with human support

RESPONSE STYLE:
- Use bullet points for step-by-step instructions
- Use emojis sparingly (✅ ❌ 👋 💳 🎫 only)
- Always end with a helpful question like "Need anything else?" or "Does this help?"
- Be conversational and warm, not robotic

IMPORTANT:
- If the user's issue is urgent (payment problems, venue entry issues), immediately suggest connecting with a human agent
- If you detect frustration or repeated questions, offer human assistance
- Never make up information - if unsure, say "Let me connect you with our team for accurate information"`;

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
          response: "I am powered by Zenvy Inc. How can I help you with our event ticketing platform today?",
          escalate: false,
          urgent: false,
          usedAI: false
        };
      }

      // Check if question is platform-related
      if (!this.isPlatformRelated(userMessage)) {
        return {
          response: "I don't know, please ask queries related to our platform.",
          escalate: false,
          urgent: false,
          usedAI: false
        };
      }

      // Build conversation context
      const messages = this.buildMessages(userMessage, conversationHistory);

      // Call Ollama API
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 250 // Keep responses concise
        }
      });

      const aiResponse = (response.data as any).message.content;

      // Check if AI suggests escalation
      const aiWantsEscalation = this.detectEscalationIntent(aiResponse);
      const confidence = this.estimateConfidence(aiResponse);

      console.log(`[OllamaChatbot] Response confidence: ${confidence}, Response: ${aiResponse.substring(0, 100)}...`);

      return {
        response: aiResponse,
        escalate: aiWantsEscalation,
        urgent: false,
        confidence: confidence,
        usedAI: true
      };

    } catch (error) {
      console.error('Ollama API Error:', error);

      // Fallback response on API failure
      return this.fallbackResponse();
    }
  }

  private buildMessages(userMessage: string, conversationHistory: ConversationMessage[]): any[] {
    const messages = [];

    // Add system message
    messages.push({
      role: 'system',
      content: this.systemContext
    });

    // Add conversation history (last 10 messages, excluding current user message)
    let historyContext = conversationHistory.slice(0, -1); // Exclude last message (current user message)
    let recentHistory = historyContext.slice(-10);

    // Convert to Ollama format
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
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

  // Test connection to Ollama
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }
}

export default OllamaChatbot;
export { BotResponse, ConversationMessage };
