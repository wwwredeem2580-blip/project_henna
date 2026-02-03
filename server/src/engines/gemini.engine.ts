import { GoogleGenerativeAI } from '@google/generative-ai';
import { ZENNY_SYSTEM_PROMPT } from './prompts/zenny.prompt';
import { ConversationMessage, BotResponse } from './chatbot.engine';


interface EscalationSignal {
  type: 'explicit' | 'frustration' | 'complexity' | 'critical_issue' | 'repeated_failure';
  score: number; // 0-1
  reason: string;
}

class GeminiChatbotImproved {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private systemContext: string;
  
  // Multi-tier escalation detection
  private criticalKeywords!: RegExp[];
  private frustrationIndicators!: RegExp[];
  private explicitEscalationPhrases!: RegExp[];
  
  // Anti-hallucination measures
  private uncertaintyPhrases: string[];
  private maxRetries: number = 2;
  private confidenceThreshold: number = 0.7;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 300,
      }
    });

    this.systemContext = this.buildEnhancedSystemPrompt();
    this.initializeEscalationPatterns();
    this.uncertaintyPhrases = [
      'not sure', 'might be', 'possibly', 'i think', 'perhaps',
      'not certain', 'may be', 'could be', 'probably', 'maybe',
      'i believe', 'it seems', 'appears to be', 'likely'
    ];
  }

  private buildEnhancedSystemPrompt(): string {
    return `${ZENNY_SYSTEM_PROMPT}

CRITICAL INSTRUCTIONS FOR ACCURACY:

1. **Answer Confidence Protocol:**
   - If you're 100% certain based on the platform info: Answer directly
   - If you're 80-99% certain: Answer but include "Let me verify with our team if you need more specific details"
2. **When to ESCALATE (say "ESCALATE_TO_HUMAN"):**
   - **Protocol**: ALWAYS try to answer with a step-by-step guide first.
   - **ONLY** escalate if:
     - The user says "that didn't help" or "I want a person".
     - The user is extremely aggressive/threatening.
   - For payment/fraud issues: Explain *why* it might be happening and ask them to check specifics first. If they persist, THEN escalate.
   - **NEVER** escalate immediately without trying to help (unless it's a life-safety emergency).

3. **Anti-Hallucination Rules:**
   - NEVER invent event details, dates, or prices
   - NEVER claim refund will be "instant" - say "3-10 business days"
   - NEVER promise features not mentioned in platform info
   - If asked about specific event details not in context: Say "I don't have access to that specific event's details. Check the event page or ask our team"

4. **Response Format:**
   - Keep responses under 150 words
   - Use bullet points only when listing 3+ items
   - Be conversational but professional
   - **Help First Protocol**: Always provide a solution step-by-step. End with "Does this help?"
   - Only output "ESCALATE_TO_HUMAN" if you are strictly handing over the conversation.

Your response:`;
  }

  private initializeEscalationPatterns(): void {
    // CRITICAL ISSUES - Immediate escalation
    this.criticalKeywords = [
      // Payment issues
      /payment\s+(failed|error|issue|problem)/i,
      /money\s+(deducted|charged|taken|gone)/i,
      /charged\s+(twice|double|2\s*times)/i,
      /bkash\s+(error|failed|problem)/i,
      /transaction\s+(failed|error|stuck)/i,
      
      // Entry issues at venue
      /at\s+the\s+(venue|gate|entry|door)/i,
      /qr\s+(not\s+working|code\s+failed|won't\s+scan)/i,
      /can'?t\s+(enter|get\s+in|access)/i,
      /entry\s+(denied|rejected|failed)/i,
      /bouncer\s+(rejected|denied|stopped)/i,
      
      // Time-critical
      /event\s+(is\s+)?(today|tonight|now|starting)/i,
      /happening\s+(now|right\s+now)/i,
      /in\s+\d+\s+(minutes|hours)\s+(event|show)/i,
      
      // Fraud/security
      /\b(fraud|scam|fake|cheat|steal)\b/i,
      /\b(police|legal|lawyer|sue)\b/i,
      
      // Bangla critical terms
      /টাকা\s+(কেটেছে|গেছে|নেই)/i,
      /ঢুকতে\s+পারছি\s+না/i,
      /কিউআর\s+কাজ\s+করছে\s+না/i,
      /প্রতারণা|ঠকান/i,
    ];

    // FRUSTRATION SIGNALS
    this.frustrationIndicators = [
      // Strong negative emotions
      /\b(frustrated|annoyed|angry|furious|pissed|mad)\b/i,
      /\b(terrible|horrible|awful|worst|pathetic|useless)\b/i,
      
      // Repeated issues
      /\b(still|again|already\s+told|keep\s+saying|told\s+you)\b/i,
      /\b(third\s+time|multiple\s+times|many\s+times)\b/i,
      
      // Giving up signals
      /\b(waste\s+of\s+time|giving\s+up|forget\s+it|never\s+mind)\b/i,
      /\b(doesn'?t\s+work|not\s+working|won'?t\s+work)\b/i,
      
      // Threats
      /\b(report|complain|review|rating|refund\s+everything)\b/i,
    ];

    // EXPLICIT ESCALATION REQUESTS
    this.explicitEscalationPhrases = [
      /talk\s+to\s+(human|person|someone|agent|representative|manager)/i,
      /speak\s+(to|with)\s+(human|person|someone|agent|support)/i,
      /\b(human\s+support|real\s+person|actual\s+person)\b/i,
      /connect\s+(me\s+)?(to|with)\s+(support|agent|team)/i,
      /\b(escalate|transfer|forward)\b/i,
      /customer\s+(service|support)/i,
      
      // Bangla
      /মানুষের\s+সাথে\s+কথা/i,
      /সাপোর্ট\s+টিম/i,
      /এজেন্ট/i,
    ];
  }

  async processMessage(
    userMessage: string, 
    conversationHistory: ConversationMessage[] = []
  ): Promise<BotResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Pre-flight escalation checks (before AI call)
      const preFlightEscalation = this.checkPreFlightEscalation(userMessage, conversationHistory);
      
      if (preFlightEscalation.shouldEscalate) {
        return {
          response: this.getEscalationMessage(preFlightEscalation.signals),
          escalate: true,
          urgent: preFlightEscalation.isUrgent,
          confidence: 'high',
          reasoning: preFlightEscalation.signals.map(s => s.reason).join('; '),
          usedAI: false,
          followUp: false,
          metadata: {
            processingTime: Date.now() - startTime,
            fallbackUsed: false
          }
        };
      }

      // Step 2: Check if question is platform-related
      if (!this.isPlatformRelated(userMessage)) {
        return {
          response: "I'm Zenny, your Zenvy support assistant! 🐾 I can help with tickets, events, payments, refunds, and hosting. What would you like to know?",
          escalate: false,
          urgent: false,
          confidence: 'high',
          usedAI: false,
          followUp: false,
          metadata: {
            processingTime: Date.now() - startTime,
            fallbackUsed: false
          }
        };
      }

      // Step 3: Handle simple policy violations
      const policyCheck = this.detectPolicyViolation(userMessage);
      if (policyCheck.isViolation && policyCheck.response) {
        return {
          response: policyCheck.response,
          escalate: false,
          urgent: false,
          confidence: 'high',
          usedAI: false,
          followUp: false,
          metadata: {
            processingTime: Date.now() - startTime,
            fallbackUsed: false
          }
        };
      }

      // Step 4: Call AI with enhanced context
      const aiResponse = await this.callAIWithRetry(userMessage, conversationHistory);
      
      // Step 5: Post-process AI response
      const processedResponse = this.postProcessAIResponse(
        aiResponse, 
        userMessage, 
        conversationHistory,
        startTime
      );

      return processedResponse;

    } catch (error) {
      console.error('[GeminiImproved] Error:', error);
      return this.getFailsafeResponse(error, Date.now() - startTime);
    }
  }

  /**
   * Pre-flight escalation check - catches critical issues before AI call
   */
  private checkPreFlightEscalation(
    message: string, 
    history: ConversationMessage[]
  ): { shouldEscalate: boolean; isUrgent: boolean; signals: EscalationSignal[] } {
    const signals: EscalationSignal[] = [];

    // Check 1: Explicit escalation request
    if (this.explicitEscalationPhrases.some(p => p.test(message))) {
      signals.push({
        type: 'explicit',
        score: 1.0,
        reason: 'User explicitly requested human support'
      });
    }

    // Check 2: Critical issues
    const criticalMatches = this.criticalKeywords.filter(p => p.test(message));
    if (criticalMatches.length > 0) {
      signals.push({
        type: 'critical_issue',
        score: 1.0,
        reason: `Critical issue detected: ${criticalMatches.length} critical keywords found`
      });
    }

    // Check 3: High frustration
    const frustrationMatches = this.frustrationIndicators.filter(p => p.test(message));
    if (frustrationMatches.length >= 2) {
      signals.push({
        type: 'frustration',
        score: frustrationMatches.length * 0.3,
        reason: `High frustration: ${frustrationMatches.length} frustration indicators`
      });
    }

    // Check 4: Repeated questions (same question 2+ times)
    const repeatedCount = this.countRepeatedQuestions(message, history);
    if (repeatedCount >= 2) {
      signals.push({
        type: 'repeated_failure',
        score: Math.min(repeatedCount * 0.4, 1.0),
        reason: `User asked similar question ${repeatedCount} times without resolution`
      });
    }

    // Check 5: Long unresolved conversation (>8 messages)
    if (history.length > 8) {
      const recentUserMessages = history.slice(-8).filter(m => m.role === 'user').length;
      if (recentUserMessages > 5) {
        signals.push({
          type: 'complexity',
          score: 0.6,
          reason: 'Long conversation without resolution'
        });
      }
    }

    // Escalation decision
    const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
    const shouldEscalate = totalScore >= 1.0 || signals.some(s => s.type === 'explicit' || s.type === 'critical_issue');
    const isUrgent = signals.some(s => s.type === 'critical_issue');

    return { shouldEscalate, isUrgent, signals };
  }

  /**
   * Call AI with retry logic for reliability
   */
  private async callAIWithRetry(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    attempt: number = 1
  ): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: this.formatHistory(conversationHistory),
      });

      const result = await chat.sendMessage(this.buildPrompt(userMessage));
      const response = result.response.text();

      // Check if response is too vague/uncertain
      if (attempt === 1 && this.isResponseTooUncertain(response)) {
        console.warn('[GeminiImproved] Response too uncertain, retrying with stricter prompt');
        return this.callAIWithRetry(
          `${userMessage}\n\n[IMPORTANT: Be specific and confident in your answer, or say you need to escalate]`,
          conversationHistory,
          2
        );
      }

      return response;

    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(`[GeminiImproved] Retry ${attempt}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.callAIWithRetry(userMessage, conversationHistory, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Post-process AI response to detect escalation signals and calculate confidence
   */
  private postProcessAIResponse(
    aiResponse: string,
    userMessage: string,
    history: ConversationMessage[],
    startTime: number
  ): BotResponse {
    // Check if AI wants to escalate
    // Check if AI wants to escalate (Stricter checks)
    const aiWantsEscalation = 
      /ESCALATE_TO_HUMAN/i.test(aiResponse) ||
      /transferring.*to.*support/i.test(aiResponse) ||
      /connecting.*to.*agent/i.test(aiResponse);

    // Clean escalation markers from response
    let cleanedResponse = aiResponse
      .replace(/ESCALATE_TO_HUMAN/gi, '')
      .replace(/\[.*ESCALATE.*\]/gi, '') // Remove any bracketed system notes
      .trim();

    // Calculate confidence
    const confidence = this.calculateResponseConfidence(cleanedResponse, userMessage);

    // Low confidence should trigger escalation
    const shouldEscalateDueToLowConfidence = confidence === 'low';

    // Final escalation decision
    const shouldEscalate = aiWantsEscalation || shouldEscalateDueToLowConfidence;

    // If escalating due to low confidence, modify response
    if (shouldEscalateDueToLowConfidence && !aiWantsEscalation) {
      cleanedResponse = "I want to make sure you get accurate information. Let me connect you with our support team who can help you better with this specific query.";
    }

    return {
      response: cleanedResponse,
      escalate: shouldEscalate,
      urgent: false,
      followUp: false,
      confidence: confidence,
      reasoning: shouldEscalateDueToLowConfidence 
        ? 'Low confidence response - escalating for accuracy'
        : aiWantsEscalation 
          ? 'AI determined escalation needed'
          : 'Normal response',
      usedAI: true,
      metadata: {
        processingTime: Date.now() - startTime,
        fallbackUsed: false
      }
    };
  }

  /**
   * Calculate response confidence based on uncertainty indicators
   */
  private calculateResponseConfidence(response: string, userMessage: string): 'high' | 'medium' | 'low' {
    const lowerResponse = response.toLowerCase();
    
    // Count uncertainty phrases
    const uncertaintyCount = this.uncertaintyPhrases.filter(phrase => 
      lowerResponse.includes(phrase)
    ).length;

    // Check for hedging language
    const hedgingPatterns = [
      /i('m| am) not (completely )?sure/i,
      /i (can't|cannot) say for certain/i,
      /i don't have (enough|sufficient) information/i,
      /you (might want to|should) check/i,
      /this (might|may|could) (be|mean)/i,
    ];
    const hedgingCount = hedgingPatterns.filter(p => p.test(response)).length;

    // Check if response is too short (< 50 chars often means uncertain)
    const isTooShort = response.length < 50 && !this.isGreeting(userMessage);

    // Check if response asks for clarification
    const asksForClarification = /can you (clarify|specify|tell me more)/i.test(response);

    // Calculate confidence
    const totalUncertaintySignals = uncertaintyCount + hedgingCount + (isTooShort ? 1 : 0) + (asksForClarification ? 1 : 0);

    if (totalUncertaintySignals >= 3) return 'low';
    if (totalUncertaintySignals >= 1) return 'medium';
    return 'high';
  }

  /**
   * Check if response is too uncertain and needs retry
   */
  private isResponseTooUncertain(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    
    // Multiple uncertainty phrases in one response
    const uncertaintyCount = this.uncertaintyPhrases.filter(phrase => 
      lowerResponse.includes(phrase)
    ).length;

    return uncertaintyCount >= 3;
  }

  /**
   * Count repeated questions in conversation history
   */
  private countRepeatedQuestions(message: string, history: ConversationMessage[]): number {
    const normalized = message.toLowerCase().trim();
    const userMessages = history.filter(m => m.role === 'user').map(m => m.text.toLowerCase().trim());
    
    // Simple similarity check - if >70% of words match
    const messageWords = new Set(normalized.split(/\s+/));
    
    let repeatCount = 0;
    for (const prevMessage of userMessages) {
      const prevWords = new Set(prevMessage.split(/\s+/));
      const commonWords = [...messageWords].filter(w => prevWords.has(w)).length;
      const similarity = commonWords / Math.max(messageWords.size, prevWords.size);
      
      if (similarity > 0.7) {
        repeatCount++;
      }
    }
    
    return repeatCount;
  }

  /**
   * Generate appropriate escalation message based on signals
   */
  private getEscalationMessage(signals: EscalationSignal[]): string {
    const signalTypes = signals.map(s => s.type);

    if (signalTypes.includes('critical_issue')) {
      return "This needs immediate attention! 🚨 I'm connecting you with our support team right away. They'll help you resolve this ASAP.";
    }

    if (signalTypes.includes('explicit')) {
      return "Of course! I'm connecting you with a human support agent now. They'll be with you shortly! 👋";
    }

    if (signalTypes.includes('frustration')) {
      return "I understand your frustration. Let me get you connected with our support team who can better assist you with this issue. 🙏";
    }

    if (signalTypes.includes('repeated_failure')) {
      return "I notice we haven't been able to resolve this yet. Let me connect you with our team who can provide more specific help. 💪";
    }

    return "Let me connect you with our support team for better assistance. They'll help you out! 👋";
  }

  /**
   * Failsafe response when everything fails
   */
  private getFailsafeResponse(error: any, processingTime: number): BotResponse {
    console.error('[GeminiImproved] Failsafe triggered:', error);
    
    return {
      response: "I'm having technical difficulties right now. Let me connect you with our support team who can help you immediately! 🔧",
      escalate: true,
      urgent: false,
      confidence: 'high',
      reasoning: 'System error - failsafe escalation',
      usedAI: false,
      followUp: false,
      metadata: {
        processingTime,
        fallbackUsed: true
      }
    };
  }

  // Helper methods
  private buildPrompt(userMessage: string): string {
    return `${this.systemContext}

USER MESSAGE: ${userMessage}

Remember: Be confident and specific, or escalate. No vague answers.`;
  }

  private formatHistory(history: ConversationMessage[]): any[] {
    let historyContext = history.slice(0, -1);
    let recentHistory = historyContext.slice(-6); // Keep last 6 messages for context

    const firstUserIndex = recentHistory.findIndex(msg => msg.role === 'user');
    if (firstUserIndex === -1) return [];

    recentHistory = recentHistory.slice(firstUserIndex);

    return recentHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }

  private isPlatformRelated(message: string): boolean {
    const lower = message.toLowerCase();

    const platformKeywords = [
      'zenvy', 'ticket', 'event', 'payment', 'bkash', 'nagad', 'refund',
      'wallet', 'qr', 'pdf', 'host', 'venue', 'payout', 'support', 'help',
      'problem', 'issue', 'error', 'buy', 'purchase', 'cancel', 'download',
      'verification', 'dashboard', 'account', 'password', 'security',
      'fraud', 'scam', 'entry', 'scan', 'agent', 'human',
    ];

    const greetingKeywords = ['hello', 'hi', 'hey', 'salam'];

    return platformKeywords.some(k => lower.includes(k)) || 
           greetingKeywords.some(k => lower.includes(k));
  }

  private isGreeting(message: string): boolean {
    const greetings = /^(hi|hello|hey|salam|assalamualaikum)$/i;
    return greetings.test(message.trim());
  }

  private detectPolicyViolation(message: string): { isViolation: boolean; response?: string } {
    const lower = message.toLowerCase();
    const wordCount = message.trim().split(/\s+/).length;

    // Only check very simple violations
    if (wordCount <= 5) {
      if (lower.includes('upgrade') && lower.includes('free')) {
        return {
          isViolation: true,
          response: "❌ Ticket upgrades aren't available after purchase. This ensures fairness to all attendees.\n\n✅ You can purchase a new VIP ticket if available!"
        };
      }

      if (lower.includes('partial refund')) {
        return {
          isViolation: true,
          response: "❌ We only offer full refunds for all tickets, not partial refunds.\n\n✅ You can request a full refund within 7 days if the event is 7+ days away."
        };
      }
    }

    return { isViolation: false };
  }
}

export default GeminiChatbotImproved;
export { BotResponse, ConversationMessage, EscalationSignal };