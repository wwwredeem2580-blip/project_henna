import { ConversationMessage } from './chatbot.engine';

export interface ConversationContext {
  userId: string;
  conversationId: string;
  frustrationLevel: number; // 0-10 scale
  repeatedQuestions: Map<string, number>;
  negativePatternCount: number;
  capsLockCount: number;
  lastEscalationSuggestion?: Date;
  userIntent?: string;
  previousIssues: string[];
}

export interface SituationalAnalysis {
  shouldEscalate: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  frustrationLevel: number;
  reasoning: string;
  suggestedResponse?: string;
  context: ConversationContext;
}

class SituationalAwarenessEngine {
  private contexts: Map<string, ConversationContext> = new Map();
  
  // Frustration indicators
  private frustrationPatterns = {
    negative: [
      /\b(not\s+working|doesn't\s+work|won't\s+work|broken|useless)\b/i,
      /\b(terrible|awful|horrible|worst|pathetic)\b/i,
      /\b(frustrated|annoyed|angry|mad|upset)\b/i,
      /\b(waste\s+of\s+time|ridiculous|stupid)\b/i,
      /\b(still|again|already\s+told|keep\s+saying)\b/i,
    ],
    urgency: [
      /\b(urgent|emergency|asap|immediately|right\s+now|hurry)\b/i,
      /\b(need\s+help\s+now|can't\s+wait|time\s+sensitive)\b/i,
      /\b(event\s+is\s+today|happening\s+now|at\s+the\s+venue)\b/i,
    ],
    escalation: [
      /\b(talk\s+to\s+(human|person|agent|manager|someone))\b/i,
      /\b(real\s+person|actual\s+person|human\s+support)\b/i,
      /\b(not\s+helping|can't\s+help|won't\s+help)\b/i,
      /\b(give\s+up|forget\s+it|never\s+mind)\b/i,
    ],
    greetings: [
      /^(hi|hello|hey|yo|sup|wassup|what's\s+up|whats\s+up)$/i,
      /^(good\s+(morning|afternoon|evening|day))$/i,
      /^(howdy|greetings|salutations)$/i,
    ]
  };

  constructor() {
    // Clean up stale contexts every hour
    setInterval(() => this.cleanupStaleContexts(), 60 * 60 * 1000);
  }

  /**
   * Analyze the current conversation state and determine if escalation is needed
   */
  analyzeConversation(
    userId: string,
    conversationId: string,
    currentMessage: string,
    conversationHistory: ConversationMessage[]
  ): SituationalAnalysis {
    // Get or create context
    const contextKey = `${userId}_${conversationId}`;
    let context = this.contexts.get(contextKey);
    
    if (!context) {
      context = this.initializeContext(userId, conversationId);
      this.contexts.set(contextKey, context);
    }

    // Update context with current message
    this.updateContext(context, currentMessage, conversationHistory);

    // Calculate frustration level
    const frustrationLevel = this.calculateFrustration(context, currentMessage);
    context.frustrationLevel = frustrationLevel;

    // Determine urgency
    const urgency = this.determineUrgency(context, currentMessage);

    // Check if escalation is needed
    const shouldEscalate = this.shouldEscalate(context, currentMessage, conversationHistory);

    // Generate reasoning
    const reasoning = this.generateReasoning(context, shouldEscalate, urgency);

    // Suggest response if needed
    const suggestedResponse = this.generateSuggestedResponse(context, shouldEscalate);

    return {
      shouldEscalate,
      urgency,
      frustrationLevel,
      reasoning,
      suggestedResponse,
      context
    };
  }

  private initializeContext(userId: string, conversationId: string): ConversationContext {
    return {
      userId,
      conversationId,
      frustrationLevel: 0,
      repeatedQuestions: new Map(),
      negativePatternCount: 0,
      capsLockCount: 0,
      previousIssues: []
    };
  }

  private updateContext(
    context: ConversationContext,
    message: string,
    history: ConversationMessage[]
  ): void {
    // Track repeated questions
    const normalizedMessage = message.toLowerCase().trim();
    const count = context.repeatedQuestions.get(normalizedMessage) || 0;
    context.repeatedQuestions.set(normalizedMessage, count + 1);

    // Count negative patterns
    let negativeCount = 0;
    for (const pattern of this.frustrationPatterns.negative) {
      if (pattern.test(message)) negativeCount++;
    }
    context.negativePatternCount += negativeCount;

    // Count caps lock usage (if >50% of message is uppercase)
    const uppercaseRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (uppercaseRatio > 0.5 && message.length > 10) {
      context.capsLockCount++;
    }

    // Extract user intent from recent messages
    if (history.length > 0) {
      const recentUserMessages = history
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => m.text);
      
      context.userIntent = this.extractIntent(recentUserMessages);
    }
  }

  private calculateFrustration(context: ConversationContext, message: string): number {
    let score = 0;

    // Don't calculate frustration for simple greetings
    const trimmedMessage = message.trim();
    if (this.frustrationPatterns.greetings.some(p => p.test(trimmedMessage))) {
      return 0;
    }

    // Reduce frustration scoring for very short messages (likely casual)
    const wordCount = message.trim().split(/\s+/).length;
    const isCasualMessage = wordCount <= 3;

    // Repeated questions (max +4)
    const maxRepetitions = Math.max(...Array.from(context.repeatedQuestions.values()));
    if (maxRepetitions >= 3) score += 4;
    else if (maxRepetitions === 2) score += 2;

    // Negative patterns (max +3)
    if (context.negativePatternCount >= 3) score += 3;
    else if (context.negativePatternCount >= 1) score += 1;

    // Caps lock usage (max +2)
    if (context.capsLockCount >= 2) score += 2;
    else if (context.capsLockCount === 1) score += 1;

    // Current message frustration indicators (max +3)
    // Reduce weight for casual messages
    const frustrationWeight = isCasualMessage ? 0.5 : 1;
    
    for (const pattern of this.frustrationPatterns.negative) {
      if (pattern.test(message)) {
        score += 1 * frustrationWeight;
        break;
      }
    }

    for (const pattern of this.frustrationPatterns.escalation) {
      if (pattern.test(message)) {
        score += 2 * frustrationWeight;
        break;
      }
    }

    return Math.min(10, score);
  }

  private determineUrgency(context: ConversationContext, message: string): 'low' | 'medium' | 'high' | 'critical' {
    // Check for urgent keywords
    const hasUrgentKeyword = this.frustrationPatterns.urgency.some(p => p.test(message));
    
    // Payment/entry issues are always critical
    const criticalPatterns = [
      /\b(payment\s+failed|money\s+deducted|charged\s+twice)\b/i,
      /\b(can't\s+enter|entry\s+denied|qr\s+not\s+working)\b/i,
      /\b(at\s+the\s+venue|event\s+is\s+now|happening\s+now)\b/i,
    ];
    
    if (criticalPatterns.some(p => p.test(message))) {
      return 'critical';
    }

    if (hasUrgentKeyword || context.frustrationLevel >= 7) {
      return 'high';
    }

    if (context.frustrationLevel >= 4) {
      return 'medium';
    }

    return 'low';
  }

  private shouldEscalate(
    context: ConversationContext,
    message: string,
    history: ConversationMessage[]
  ): boolean {
    // NEVER escalate on simple greetings
    const trimmedMessage = message.trim();
    if (this.frustrationPatterns.greetings.some(p => p.test(trimmedMessage))) {
      return false;
    }

    // Don't escalate on first 1-2 messages unless explicit escalation request
    const userMessageCount = history.filter(m => m.role === 'user').length;
    if (userMessageCount <= 2) {
      // Only escalate if explicit request or critical urgency
      const hasExplicitRequest = this.frustrationPatterns.escalation.some(p => p.test(message));
      const urgency = this.determineUrgency(context, message);
      
      if (!hasExplicitRequest && urgency !== 'critical') {
        return false;
      }
    }

    // Explicit escalation request
    if (this.frustrationPatterns.escalation.some(p => p.test(message))) {
      return true;
    }

    // High frustration level
    if (context.frustrationLevel >= 7) {
      return true;
    }

    // Same question asked 3+ times
    const maxRepetitions = Math.max(...Array.from(context.repeatedQuestions.values()));
    if (maxRepetitions >= 3) {
      return true;
    }

    // Long conversation without resolution (>10 messages, mostly user asking)
    if (history.length > 10) {
      const userMessages = history.filter(m => m.role === 'user').length;
      const botMessages = history.filter(m => m.role === 'bot').length;
      
      if (userMessages > botMessages && userMessages > 6) {
        return true;
      }
    }

    // Critical urgency
    const urgency = this.determineUrgency(context, message);
    if (urgency === 'critical') {
      return true;
    }

    return false;
  }

  private extractIntent(recentMessages: string[]): string {
    const allText = recentMessages.join(' ').toLowerCase();
    
    // Common intents
    if (/\b(refund|money\s+back|return)\b/.test(allText)) return 'refund';
    if (/\b(ticket|download|pdf|qr)\b/.test(allText)) return 'ticket_access';
    if (/\b(payment|bkash|charge|deduct)\b/.test(allText)) return 'payment_issue';
    if (/\b(login|account|password|access)\b/.test(allText)) return 'account_access';
    if (/\b(event|venue|location|time)\b/.test(allText)) return 'event_info';
    if (/\b(host|create|publish|verify)\b/.test(allText)) return 'hosting';
    
    return 'general_inquiry';
  }

  private generateReasoning(
    context: ConversationContext,
    shouldEscalate: boolean,
    urgency: string
  ): string {
    const reasons: string[] = [];

    if (shouldEscalate) {
      const maxRepetitions = Math.max(...Array.from(context.repeatedQuestions.values()));
      
      if (maxRepetitions >= 3) {
        reasons.push(`User repeated same question ${maxRepetitions} times`);
      }
      
      if (context.frustrationLevel >= 7) {
        reasons.push(`High frustration level (${context.frustrationLevel}/10)`);
      }
      
      if (urgency === 'critical') {
        reasons.push('Critical urgency detected (payment/venue issue)');
      }
      
      if (context.negativePatternCount >= 3) {
        reasons.push('Multiple negative sentiment indicators');
      }
    }

    return reasons.length > 0 
      ? reasons.join('; ') 
      : `Normal conversation flow (frustration: ${context.frustrationLevel}/10)`;
  }

  private generateSuggestedResponse(
    context: ConversationContext,
    shouldEscalate: boolean
  ): string | undefined {
    if (!shouldEscalate) return undefined;

    const intent = context.userIntent || 'general_inquiry';
    
    const responses: Record<string, string> = {
      payment_issue: "I understand this is urgent. Let me connect you with our support team who can track your payment immediately. ⚡",
      ticket_access: "I see you're having trouble accessing your tickets. Let me get a human agent to help you right away. 🎫",
      refund: "I'll connect you with our team who can process your refund request immediately. 💳",
      account_access: "Account access issues need immediate attention. Connecting you with our team now. 🔐",
      general_inquiry: "I want to make sure you get the best help. Let me connect you with a human support agent. 👋"
    };

    return responses[intent] || responses.general_inquiry;
  }

  private cleanupStaleContexts(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [key, context] of this.contexts.entries()) {
      const lastActivity = context.lastEscalationSuggestion?.getTime() || 0;
      if (lastActivity < oneHourAgo) {
        this.contexts.delete(key);
      }
    }
    
    console.log(`[SituationalAwareness] Cleaned up stale contexts. Active: ${this.contexts.size}`);
  }

  /**
   * Get context for a specific conversation (useful for admin view)
   */
  getContext(userId: string, conversationId: string): ConversationContext | undefined {
    return this.contexts.get(`${userId}_${conversationId}`);
  }

  /**
   * Clear context (when conversation is closed)
   */
  clearContext(userId: string, conversationId: string): void {
    this.contexts.delete(`${userId}_${conversationId}`);
  }
}

export default SituationalAwarenessEngine;
