import { GoogleGenerativeAI } from '@google/generative-ai';
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
