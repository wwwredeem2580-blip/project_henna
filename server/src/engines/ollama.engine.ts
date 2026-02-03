import axios, { AxiosError } from 'axios';
import { ZENNY_SYSTEM_PROMPT } from './prompts/zenny.prompt';
import { BotResponse, ConversationMessage } from './chatbot.engine';

// ==================== INTERFACES ====================

// interface BotResponse removed (imported)

// ConversationMessage is imported from ./chatbot.engine

interface OllamaConfig {
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  enableRAG?: boolean;
  enableStreaming?: boolean;
  timeout?: number;
}

interface StructuredAnalysis {
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  entities: string[];
  shouldEscalate: boolean;
  escalationReason?: string;
  confidence: number;
  suggestedResponse?: string;
  requiredInfo?: string[];
}

interface RAGContext {
  documents: string[];
  relevanceScores: number[];
  sources: string[];
}

// ==================== ENHANCED OLLAMA CHATBOT ====================

class EnhancedOllamaChatbot {
  private baseUrl: string;
  private model: string;
  private systemContext: string;
  private config: Required<OllamaConfig>;
  private conversationCache: Map<string, ConversationMessage[]>;
  private performanceMetrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };

  // Escalation patterns
  private escalationPatterns = {
    payment: [
      'payment failed', 'money deducted', 'বিকাশে টাকা', 'টাকা কেটেছে',
      'charged twice', 'double charge', 'দুইবার কেটেছে', 'wrong amount',
      'refund not received', 'রিফান্ড পাইনি'
    ],
    access: [
      'entry denied', 'qr not working', 'ঢুকতে পারছি না', 'কিউআর কাজ করছে না',
      'scan failed', 'cant enter', 'access denied', 'ticket invalid'
    ],
    security: [
      'fraud', 'scam', 'ঠকানো', 'প্রতারণা', 'hacked', 'unauthorized',
      'suspicious', 'fake ticket', 'counterfeit'
    ],
    urgency: [
      'urgent', 'emergency', 'জরুরি', 'এখনই', 'asap', 'immediately',
      'right now', 'critical', 'event starting'
    ]
  };

  constructor(config: OllamaConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model || 'qwen2.5-coder:7b';
    this.systemContext = ZENNY_SYSTEM_PROMPT;
    this.conversationCache = new Map();
    
    this.config = {
      baseUrl: this.baseUrl,
      model: this.model,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 500,
      topP: config.topP ?? 0.9,
      topK: config.topK ?? 40,
      repeatPenalty: config.repeatPenalty ?? 1.1,
      enableRAG: config.enableRAG ?? false,
      enableStreaming: config.enableStreaming ?? false,
      timeout: config.timeout ?? 30000
    };

    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };
  }

  // ==================== MAIN PROCESSING METHOD ====================

  async processMessage(
    userMessage: string,
    conversationHistory: ConversationMessage[] = [],
    sessionId?: string
  ): Promise<BotResponse> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      // Step 1: Pre-processing checks
      const preCheck = await this.runPreProcessingChecks(userMessage);
      if (preCheck) {
        this.performanceMetrics.successfulRequests++;
        return {
          ...preCheck,
          responseTime: Date.now() - startTime
        };
      }

      // Step 2: Analyze message structure with LLM
      const analysis = await this.analyzeMessageIntent(userMessage, conversationHistory);

      // Step 3: Check if immediate escalation is needed based on analysis
      if (analysis.shouldEscalate) {
        this.performanceMetrics.successfulRequests++;
        return {
          response: analysis.suggestedResponse || 
            "I understand this needs immediate attention. Let me connect you with our support team right away! ⚡",
          escalate: true,
          urgent: analysis.sentiment === 'urgent',
          confidence: analysis.confidence > 0.8 ? 'high' : 'medium',
          reasoning: analysis.escalationReason,
          usedAI: true,
          followUp: false,
          responseTime: Date.now() - startTime
        };
      }

      // Step 4: Retrieve RAG context if enabled
      let ragContext: RAGContext | null = null;
      if (this.config.enableRAG) {
        ragContext = await this.retrieveRAGContext(userMessage, analysis);
      }

      // Step 5: Generate intelligent response
      const aiResponse = await this.generateResponse(
        userMessage,
        conversationHistory,
        analysis,
        ragContext
      );

      // Step 6: Post-process and validate response
      const finalResponse = await this.postProcessResponse(aiResponse, analysis);

      this.performanceMetrics.successfulRequests++;
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);

      return {
        ...finalResponse,
        responseTime,
        matchedIntent: analysis.intent,
        confidence: this.calculateFinalConfidence(analysis, finalResponse),
        contextUsed: ragContext?.sources || [],
        usedAI: true
      };

    } catch (error) {
      this.performanceMetrics.failedRequests++;
      console.error('[EnhancedOllamaChatbot] Error processing message:', error);
      return this.handleError(error, Date.now() - startTime);
    }
  }

  // ==================== PRE-PROCESSING CHECKS ====================

  private async runPreProcessingChecks(message: string): Promise<BotResponse | null> {
    // Check for model/creator questions
    if (this.isModelQuestion(message)) {
      return {
        response: "I'm Zenny, powered by Zenvy Inc's intelligent support system! I'm here to help you with our event ticketing platform. What can I assist you with today? 🎫",
        escalate: false,
        urgent: false,
        followUp: false,
        confidence: 'high',
        usedAI: false
      };
    }

    // Check for off-topic queries
    if (!this.isPlatformRelated(message)) {
      return {
        response: "I specialize in helping with Zenvy's event ticketing platform. Could you please ask me something related to tickets, events, payments, or our services? 🎭",
        escalate: false,
        urgent: false,
        followUp: false,
        confidence: 'high',
        usedAI: false
      };
    }

    // Check for policy violations (immutable rules)
    const policyCheck = this.detectPolicyViolation(message);
    if (policyCheck.isViolation && policyCheck.response) {
      return {
        response: policyCheck.response,
        escalate: false,
        urgent: false,
        followUp: false,
        confidence: 'high',
        usedAI: false
      };
    }

    return null;
  }

  // ==================== INTELLIGENT MESSAGE ANALYSIS ====================

  private async analyzeMessageIntent(
    message: string,
    conversationHistory: ConversationMessage[]
  ): Promise<StructuredAnalysis> {
    try {
      const analysisPrompt = `You are an intelligent message analyzer for a customer support chatbot. Analyze the following user message and conversation history.

User Message: "${message}"

Conversation History:
${this.formatConversationHistory(conversationHistory.slice(-5))}

Provide a structured analysis in the following JSON format:
{
  "intent": "category of the query (e.g., payment_issue, ticket_access, refund_request, general_inquiry)",
  "sentiment": "positive|neutral|negative|urgent",
  "entities": ["extracted important entities like ticket IDs, event names, amounts, etc."],
  "shouldEscalate": true/false,
  "escalationReason": "reason for escalation if applicable",
  "confidence": 0.0-1.0,
  "suggestedResponse": "brief suggested response if escalation needed",
  "requiredInfo": ["missing information needed to help the user"]
}

Escalate ONLY if:
- User EXPLICITLY asks for a human/agent ("talk to person", "connect me").
- User indicates previous attempts failed ("tried that", "didn't work").
- Severe security threats (active hacking, legal threats).

For everything else (including payment issues, bugs, confusion):
- Set shouldEscalate: false.
- Provide a 'suggestedResponse' with step-by-step troubleshooting steps.
- PRIORITIZE helping the user solve it themselves first.

Respond ONLY with valid JSON.`;

      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a precise JSON analyzer. Return only valid JSON.' },
            { role: 'user', content: analysisPrompt }
          ],
          stream: false,
          options: {
            temperature: 0.3, // Lower for more consistent structured output
            num_predict: 300
          },
          format: 'json' // Request JSON format from Ollama
        },
        { timeout: this.config.timeout }
      );

      const content = response.data.message.content;
      const analysis = this.parseJSONSafely<StructuredAnalysis>(content);

      if (analysis) {
        return analysis;
      }

      // Fallback analysis
      return this.createFallbackAnalysis(message);

    } catch (error) {
      console.error('[EnhancedOllamaChatbot] Intent analysis failed:', error);
      return this.createFallbackAnalysis(message);
    }
  }

  // ==================== RAG CONTEXT RETRIEVAL ====================

  private async retrieveRAGContext(
    message: string,
    analysis: StructuredAnalysis
  ): Promise<RAGContext | null> {
    try {
      // This is a placeholder for RAG implementation
      // In production, you would:
      // 1. Convert message to embeddings
      // 2. Query vector database
      // 3. Retrieve relevant documents
      // 4. Rank by relevance

      // For now, return contextual information based on intent
      const contextDocs = this.getContextualDocuments(analysis.intent);

      if (contextDocs.length > 0) {
        return {
          documents: contextDocs,
          relevanceScores: contextDocs.map(() => 0.8),
          sources: ['FAQ Database', 'Policy Documents']
        };
      }

      return null;
    } catch (error) {
      console.error('[EnhancedOllamaChatbot] RAG retrieval failed:', error);
      return null;
    }
  }

  // ==================== RESPONSE GENERATION ====================

  private async generateResponse(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    analysis: StructuredAnalysis,
    ragContext: RAGContext | null
  ): Promise<string> {
    // Build enhanced context
    const messages = this.buildEnhancedMessages(
      userMessage,
      conversationHistory,
      analysis,
      ragContext
    );

    const response = await axios.post(
      `${this.baseUrl}/api/chat`,
      {
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
          top_p: this.config.topP,
          top_k: this.config.topK,
          repeat_penalty: this.config.repeatPenalty
        }
      },
      { timeout: this.config.timeout }
    );

    return response.data.message.content;
  }

  // ==================== MESSAGE BUILDING ====================

  private buildEnhancedMessages(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    analysis: StructuredAnalysis,
    ragContext: RAGContext | null
  ): any[] {
    const messages = [];

    // Enhanced system prompt with context
    let enhancedSystemPrompt = this.systemContext;

    // Add RAG context if available
    if (ragContext && ragContext.documents.length > 0) {
      enhancedSystemPrompt += `\n\n### RELEVANT CONTEXT:\n${ragContext.documents.join('\n\n')}`;
    }

    // Add intent and sentiment awareness
    enhancedSystemPrompt += `\n\n### CURRENT CONVERSATION ANALYSIS:
- User Intent: ${analysis.intent}
- Sentiment: ${analysis.sentiment}
- Entities Detected: ${analysis.entities.join(', ') || 'None'}
${analysis.requiredInfo && analysis.requiredInfo.length > 0 
  ? `- Missing Information: ${analysis.requiredInfo.join(', ')}` 
  : ''}

Tailor your response accordingly. If information is missing, politely ask for it.`;

    messages.push({
      role: 'system',
      content: enhancedSystemPrompt
    });

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  // ==================== POST-PROCESSING ====================

  private async postProcessResponse(
    aiResponse: string,
    analysis: StructuredAnalysis
  ): Promise<BotResponse> {
    // Detect if AI suggests escalation
    const aiWantsEscalation = this.detectEscalationIntent(aiResponse);
    
    // Estimate confidence
    const confidence = this.estimateResponseConfidence(aiResponse, analysis);
    
    // Check if needs clarification
    const needsClarification = this.detectClarificationNeed(aiResponse);
    
    // Extract suggested actions
    const suggestedActions = this.extractSuggestedActions(aiResponse);

    return {
      response: aiResponse,
      escalate: aiWantsEscalation,
      urgent: analysis.sentiment === 'urgent',
      confidence,
      needsClarification,
      suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      reasoning: aiWantsEscalation ? 'AI detected need for human intervention' : undefined,
      followUp: false
    };
  }

  // ==================== HELPER METHODS ====================

  private formatConversationHistory(history: ConversationMessage[]): string {
    return history
      .map(msg => `${msg.role.toUpperCase()}: ${msg.text}`)
      .join('\n');
  }

  private parseJSONSafely<T>(content: string): T | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/);
      
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonString.trim());
    } catch (error) {
      console.error('[EnhancedOllamaChatbot] JSON parsing failed:', error);
      return null;
    }
  }

  private createFallbackAnalysis(message: string): StructuredAnalysis {
    const lowerMessage = message.toLowerCase();
    
    // Detect urgency through keyword matching
    const isUrgent = Object.values(this.escalationPatterns)
      .flat()
      .some(keyword => lowerMessage.includes(keyword));

    return {
      intent: 'general_inquiry',
      sentiment: isUrgent ? 'urgent' : 'neutral',
      entities: [],
      shouldEscalate: isUrgent,
      escalationReason: isUrgent ? 'Urgent keywords detected' : undefined,
      confidence: 0.6,
      requiredInfo: []
    };
  }

  private getContextualDocuments(intent: string): string[] {
    // Placeholder for RAG document retrieval
    const contextMap: Record<string, string[]> = {
      payment_issue: [
        'Payment processing takes 24-48 hours. Refunds are processed within 3-10 business days.',
        'Supported payment methods: bKash, Nagad, Card payments through SSLCommerz.'
      ],
      refund_request: [
        'Refund eligibility: Within 7 days of purchase, event is 7+ days away, ticket not scanned.',
        'Refunds are processed to the original payment method within 3-10 business days.'
      ],
      ticket_access: [
        'Tickets are delivered via email as PDF with QR code. Check spam folder if not received.',
        'QR code must be scanned at venue entry. One-time use only.'
      ]
    };

    return contextMap[intent] || [];
  }

  private detectEscalationIntent(response: string): boolean {
    const escalationPhrases = [
      'connecting you with',
      'transfer you to',
      'let me transfer',
      'escalating to',
      'agent will join',
      'handing over to'
    ];

    return escalationPhrases.some(phrase =>
      response.toLowerCase().includes(phrase)
    );
  }

  private estimateResponseConfidence(
    response: string,
    analysis: StructuredAnalysis
  ): 'high' | 'medium' | 'low' {
    const uncertainPhrases = [
      'not sure', 'might be', 'possibly', 'i think',
      'let me check', 'not certain', 'may be', 'could be',
      'perhaps', 'maybe'
    ];

    const hasUncertainty = uncertainPhrases.some(phrase =>
      response.toLowerCase().includes(phrase)
    );

    if (hasUncertainty || analysis.confidence < 0.6) return 'low';
    if (analysis.confidence < 0.8) return 'medium';
    return 'high';
  }

  private detectClarificationNeed(response: string): boolean {
    const clarificationIndicators = [
      'could you provide',
      'can you share',
      'please provide',
      'need more information',
      'which event',
      'which ticket',
      'when did',
      'what is your'
    ];

    return clarificationIndicators.some(indicator =>
      response.toLowerCase().includes(indicator)
    );
  }

  private extractSuggestedActions(response: string): string[] {
    const actions: string[] = [];
    
    // Look for action patterns
    const actionPatterns = [
      /you can (.*?)(?:\.|!|\n|$)/gi,
      /try (.*?)(?:\.|!|\n|$)/gi,
      /please (.*?)(?:\.|!|\n|$)/gi
    ];

    actionPatterns.forEach(pattern => {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length < 100) {
          actions.push(match[1].trim());
        }
      }
    });

    return actions.slice(0, 3); // Limit to top 3 actions
  }

  private calculateFinalConfidence(
    analysis: StructuredAnalysis,
    response: Partial<BotResponse>
  ): 'high' | 'medium' | 'low' {
    if (response.confidence) return response.confidence;
    
    // Combine analysis confidence with other factors
    if (analysis.confidence > 0.8 && !response.needsClarification) return 'high';
    if (analysis.confidence > 0.6) return 'medium';
    return 'low';
  }

  // ==================== VALIDATION METHODS ====================

  private isModelQuestion(message: string): boolean {
    const lower = message.toLowerCase();
    const modelKeywords = [
      'what model', 'which model', 'your model', 'model are you',
      'who created you', 'who made you', 'who built you', 'your creator',
      'who is your provider', 'your provider', 'powered by', 'based on',
      'what ai', 'which ai', 'your ai', 'openai', 'gpt', 'ollama',
      'qwen', 'gemini', 'anthropic', 'claude', 'llama'
    ];

    return modelKeywords.some(keyword => lower.includes(keyword));
  }

  private isPlatformRelated(message: string): boolean {
    const lower = message.toLowerCase();

    const platformKeywords = [
      // Core features
      'zenvy', 'ticket', 'event', 'payment', 'bkash', 'nagad', 'refund',
      'wallet', 'qr', 'pdf', 'login', 'google', 'host', 'venue', 'analytics',
      'payout', 'support', 'help', 'how to', 'problem', 'issue', 'error',
      
      // Actions
      'buy', 'purchase', 'cancel', 'transfer', 'download', 'filter',
      'category', 'location', 'reminder', 'verification', 'document',
      'approval', 'dashboard', 'profile', 'account', 'password', 'session',
      
      // Issues
      'fraud', 'scam', 'charge', 'deduct', 'money', 'entry', 'scan',
      'urgent', 'emergency',
      
      // Support
      'agent', 'human', 'representative', 'connect', 'person', 'someone',
      
      // Bangla keywords
      'কিউআর', 'টিকেট', 'ইভেন্ট', 'পেমেন্ট', 'বিকাশ',
      'রিফান্ড', 'ওয়ালেট', 'লগইন', 'গুগল', 'হোস্ট', 'ভেন্যু', 'সাপোর্ট'
    ];

    const hasPlatformKeyword = platformKeywords.some(keyword => 
      lower.includes(keyword)
    );

    // Allow greetings and conversational starters
    const greetingKeywords = [
      'hello', 'hi', 'hey', 'assalamualaikum', 'salam', 'হ্যালো', 'হাই',
      'কেমন আছেন', 'how are you', 'what\'s up', 'yo', 'sup', 'good morning',
      'good evening', 'good afternoon'
    ];
    const isGreeting = greetingKeywords.some(keyword => lower.includes(keyword));

    // Allow self-referential questions in platform context
    const selfKeywords = ['who are you', 'what are you', 'your name', 'what can you do'];
    const isSelfQuestion = selfKeywords.some(keyword => lower.includes(keyword));

    return hasPlatformKeyword || isGreeting || isSelfQuestion;
  }

  private detectPolicyViolation(message: string): { 
    isViolation: boolean; 
    response?: string 
  } {
    const lower = message.toLowerCase();
    const wordCount = message.trim().split(/\s+/).length;

    // Only enforce strict policy checks on short, direct requests
    if (wordCount > 5) {
      return { isViolation: false };
    }

    // VIP upgrade without payment
    if (
      (lower.includes('upgrade') || lower.includes('vip')) && 
      (lower.includes('free') || lower.includes('without pay') || lower.includes('no pay'))
    ) {
      return {
        isViolation: true,
        response: "❌ **Policy Restriction**\n\nTicket tiers cannot be upgraded after purchase. This ensures fairness to all attendees who paid for their tier.\n\n✅ **Alternative:** You can purchase a new VIP ticket if available.\n\nNeed anything else? 🎭"
      };
    }

    // Partial refund request
    if (
      (lower.includes('partial') || lower.includes('one ticket') || lower.includes('1 ticket')) && 
      lower.includes('refund')
    ) {
      return {
        isViolation: true,
        response: "❌ **No Partial Refunds**\n\nOur policy supports full refunds only for all tickets in a transaction.\n\n✅ **Refund Eligibility:**\n• Within 7 days of purchase\n• Event is 7+ days away\n• Tickets not scanned\n\nProcessing: 3-10 business days. Can I help with anything else? ✨"
      };
    }

    // Free ticket cancellation
    if (lower.includes('cancel') && lower.includes('free')) {
      return {
        isViolation: true,
        response: "❌ **Free Tickets Non-Cancellable**\n\nOnce claimed, free tickets count toward your monthly limit (10 max) and cannot be cancelled.\n\n✅ **Tip:** Your quota resets on the 1st of each month. Claim wisely!\n\nAnything else? 🎫"
      };
    }

    // Ticket limit violations
    if (
      (lower.includes('more than') || lower.includes('exceed') || /\b[6-9]\b|\b1[0-9]\b/.test(lower)) &&
      lower.includes('ticket')
    ) {
      return {
        isViolation: true,
        response: "🎫 **Ticket Purchase Limits**\n\n• Max 5 paid tickets per event\n• Max 2 free tickets per event\n• Max 10 free tickets per month\n\nThese limits prevent scalping and ensure fair distribution. Excess purchases are auto-refunded. 🛡️"
      };
    }

    // Transfer tickets (not available)
    if (lower.includes('transfer') && lower.includes('ticket')) {
      return {
        isViolation: true,
        response: "🚧 **Ticket Transfers - Coming Soon!**\n\nThis feature is under development.\n\nCurrently, tickets are linked to the purchaser's account. Stay tuned for updates! 🔔"
      };
    }

    return { isViolation: false };
  }

  // ==================== ERROR HANDLING ====================

  private handleError(error: unknown, responseTime: number): BotResponse {
    let errorMessage = 'An unexpected error occurred';
    let shouldEscalate = true;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED') {
        errorMessage = "I'm having trouble connecting to my AI engine. Let me connect you with a human agent who can help immediately!";
      } else if (axiosError.code === 'ETIMEDOUT') {
        errorMessage = "The response is taking longer than expected. Would you like to speak with a human agent?";
      } else {
        errorMessage = "I encountered a technical issue. Let me get you connected with our support team.";
      }
    }

      return {
        response: errorMessage,
        escalate: shouldEscalate,
        urgent: false,
        followUp: false,
        confidence: 'low',
        usedAI: false,
        responseTime
      };
  }

  // ==================== PERFORMANCE TRACKING ====================

  private updateAverageResponseTime(responseTime: number): void {
    const total = this.performanceMetrics.averageResponseTime * 
                  (this.performanceMetrics.successfulRequests - 1);
    this.performanceMetrics.averageResponseTime = 
      (total + responseTime) / this.performanceMetrics.successfulRequests;
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      successRate: this.performanceMetrics.totalRequests > 0
        ? (this.performanceMetrics.successfulRequests / this.performanceMetrics.totalRequests) * 100
        : 0
    };
  }

  // ==================== UTILITY METHODS ====================

  async testConnection(): Promise<{
    connected: boolean;
    model: string;
    availableModels?: string[];
    error?: string;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      const models = response.data.models?.map((m: any) => m.name) || [];
      const modelExists = models.includes(this.model);

      return {
        connected: true,
        model: this.model,
        availableModels: models,
        error: modelExists ? undefined : `Model ${this.model} not found. Available: ${models.join(', ')}`
      };
    } catch (error) {
      return {
        connected: false,
        model: this.model,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }

  async warmupModel(): Promise<boolean> {
    try {
      console.log('[EnhancedOllamaChatbot] Warming up model...');
      await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: this.model,
          messages: [
            { role: 'user', content: 'Hello' }
          ],
          stream: false,
          options: { num_predict: 10 }
        },
        { timeout: 10000 }
      );
      console.log('[EnhancedOllamaChatbot] Model warmed up successfully');
      return true;
    } catch (error) {
      console.error('[EnhancedOllamaChatbot] Model warmup failed:', error);
      return false;
    }
  }

  updateConfig(config: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...config };
  }

  clearConversationCache(sessionId?: string): void {
    if (sessionId) {
      this.conversationCache.delete(sessionId);
    } else {
      this.conversationCache.clear();
    }
  }

  resetMetrics(): void {
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };
  }
}

// ==================== EXPORTS ====================

export default EnhancedOllamaChatbot;
export {
  BotResponse,
  ConversationMessage,
  OllamaConfig,
  StructuredAnalysis,
  RAGContext
};