import axios from 'axios';
import { ZENNY_SYSTEM_PROMPT } from './prompts/zenny.prompt';

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
    this.systemContext = ZENNY_SYSTEM_PROMPT;

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
      // Check if user explicitly wants human support
      if (this.wantsHumanSupport(userMessage)) {
        return {
          response: "Of course! Let me connect you with a human support agent right away. They'll be with you shortly! 🏃",
          escalate: true,
          urgent: false,
          usedAI: false
        };
      }

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

      // Check for policy violations detection
      const policyCheck = this.detectPolicyViolation(userMessage);
      if (policyCheck.isViolation && policyCheck.response) {
        return {
          response: policyCheck.response,
          escalate: false,
          urgent: false,
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
    // Lighten regex layer: Only catch extremely short phrases (<= 3 words)
    // Anything longer goes to LLM for full context understanding
    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount > 3) {
      return false;
    }

    const lower = message.toLowerCase();
    return this.escalationKeywords.some(keyword => lower.includes(keyword));
  }

  private wantsHumanSupport(message: string): boolean {
    const lower = message.toLowerCase();
    const humanRequestPhrases = [
      'talk to human', 'speak to human', 'human support', 'human agent',
      'connect me with support', 'escalate', 'talk to someone', 'speak to someone',
      'real person', 'actual person', 'support agent', 'customer service',
      'মানুষের সাথে কথা', 'সাপোর্ট টিম', 'এজেন্ট', 'কাস্টমার সার্ভিস'
    ];
    
    return humanRequestPhrases.some(phrase => lower.includes(phrase));
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

  private detectPolicyViolation(message: string): { isViolation: boolean; response?: string } {
    // Lighten regex layer: Only catch extremely short questions (<= 3 words)
    // Complex questions go to LLM/RAG for nuance
    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount > 3) {
      return { isViolation: false };
    }

    const lower = message.toLowerCase();

    // VIP upgrade without payment
    if ((lower.includes('upgrade') || lower.includes('vip')) && 
        (lower.includes('free') || lower.includes('without pay') || lower.includes('no pay'))) {
      return {
        isViolation: true,
        response: "❌ Sorry, ticket tiers are immutable after purchase. This ensures fairness to other attendees who paid for VIP.\n\n✅ What you CAN do: Purchase a new VIP ticket if still available.\n\nNeed anything else? 🐾"
      };
    }

    // Partial refund request
    if ((lower.includes('partial') || lower.includes('one ticket') || lower.includes('1 ticket')) && 
        lower.includes('refund')) {
      return {
        isViolation: true,
        response: "❌ Partial refunds aren't supported. Our policy is full refund only - it's all or nothing.\n\n✅ What you CAN do: Request a full refund for ALL tickets if:\n• Within 7 days of purchase\n• Event is 7+ days away\n• Ticket hasn't been scanned\n\nProcessing takes 3-10 business days. Does this help? ✨"
      };
    }

    // Cancel free ticket
    if (lower.includes('cancel') && (lower.includes('free ticket') || lower.includes('free'))) {
      return {
        isViolation: true,
        response: "❌ Free tickets cannot be cancelled once claimed. They count toward your monthly limit of 10 free tickets.\n\n✅ Tip: Claim free tickets wisely! Your quota resets on the 1st of each month.\n\nAnything else I can help with? 🐾"
      };
    }

    // Exceed ticket limits
    if ((lower.includes('more than') || lower.includes('exceed') || lower.includes('buy 6') || lower.includes('buy 10')) && 
        lower.includes('ticket')) {
      return {
        isViolation: true,
        response: "❌ Ticket limits are in place for anti-scalping protection:\n• Max 5 paid tickets per event\n• Max 2 free tickets per event\n• Max 10 free tickets per month\n\n✅ What happens: Excess tickets are automatically refunded.\n\nThis ensures fair distribution for everyone! 🎫"
      };
    }

    // Transfer tickets (not yet available)
    if (lower.includes('transfer') && lower.includes('ticket')) {
      return {
        isViolation: true,
        response: "❌ Ticket transfers are not yet implemented.\n\n✅ Coming soon: We're working on this feature!\n\nFor now, tickets are locked to the purchaser's account. Need help with something else? 🐾"
      };
    }

    return { isViolation: false };
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
