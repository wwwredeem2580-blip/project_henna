import GeminiChatbotImproved, { BotResponse, ConversationMessage, EscalationSignal } from './gemini.engine';
import OllamaChatbot from './ollama.engine';
import ChatbotEngine from './chatbot.engine';
import RAGService from './rag.engine';
import SituationalAwarenessEngine, { SituationalAnalysis } from './situational.engine';

type AIProvider = 'gemini' | 'ollama' | 'claude';

interface ProviderConfig {
  gemini?: {
    apiKey?: string;
  };
  ollama?: {
    baseUrl?: string;
    model?: string;
  };
  claude?: {
    apiKey?: string;
    model?: string;
  };
}

interface ProcessingMetrics {
  route: 'rule' | 'rag' | 'ai' | 'situational' | 'failsafe';
  processingTimeMs: number;
  ragHit?: boolean;
  ragSimilarity?: number;
  confidenceScore: number; // 0-1
  escalationScore: number; // 0-1
  usedFallback: boolean;
}

interface EnhancedBotResponse extends BotResponse {
  metrics?: ProcessingMetrics;
  situationalAnalysis?: SituationalAnalysis;
}

/**
 * Industry-grade hybrid chatbot with intelligent routing and fallback chains
 */
class HybridChatbotImproved {
  private aiBot: GeminiChatbotImproved | OllamaChatbot | null;
  private ruleBasedBot: ChatbotEngine;
  private ragService: RAGService | null;
  private situationalEngine: SituationalAwarenessEngine;
  private provider: AIProvider;
  private useAI: boolean;
  private useRAG: boolean;
  private useSituationalAwareness: boolean;

  // Routing decision thresholds
  private readonly RAG_SIMILARITY_THRESHOLD = 0.88; // Higher threshold for RAG cache
  private readonly LOW_CONFIDENCE_THRESHOLD = 0.45; // Reduced from 0.6 to prevent premature escalation
  private readonly ESCALATION_SCORE_THRESHOLD = 0.7;

  constructor(
    provider: AIProvider = 'gemini', 
    config?: ProviderConfig, 
    chromaHost?: string, 
    chromaPort?: number
  ) {
    console.log('[HybridImproved] Initializing...');
    
    // Initialize core components
    this.ruleBasedBot = new ChatbotEngine();
    this.situationalEngine = new SituationalAwarenessEngine();
    this.provider = provider;

    // Initialize AI provider
    this.useAI = false;
    this.aiBot = null;

    switch (provider) {
      case 'gemini':
        if (config?.gemini?.apiKey) {
          try {
            this.aiBot = new GeminiChatbotImproved(config.gemini.apiKey);
            this.useAI = true;
            console.log('[HybridImproved] ✅ Gemini AI enabled (improved engine)');
          } catch (error) {
            console.error('[HybridImproved] ❌ Failed to initialize Gemini:', error);
          }
        }
        break;

      case 'ollama':
        if (config?.ollama) {
          try {
            this.aiBot = new OllamaChatbot({
              baseUrl: config.ollama.baseUrl || 'http://localhost:11434',
              model: config.ollama.model || 'llama3.1:8b-instruct-q4_K_M'
            });
            this.useAI = true;
            console.log('[HybridImproved] ✅ Ollama AI enabled');
          } catch (error) {
            console.error('[HybridImproved] ❌ Failed to initialize Ollama:', error);
          }
        }
        break;

      case 'claude':
        console.log('[HybridImproved] ⏳ Claude support coming soon');
        break;
    }

    if (!this.useAI) {
      console.log('[HybridImproved] ⚠️ Using rule-based fallback only');
    }

    // Initialize RAG service
    this.useRAG = !!chromaHost && !!config?.gemini?.apiKey;

    if (this.useRAG && chromaHost && config?.gemini?.apiKey) {
      try {
        this.ragService = new RAGService(
          chromaHost,
          chromaPort || 8000,
          config.gemini.apiKey,
          this.RAG_SIMILARITY_THRESHOLD,
          30
        );

        this.ragService.initialize().then(() => {
          console.log('[HybridImproved] ✅ RAG layer enabled');
        }).catch((error: any) => {
          console.error('[HybridImproved] ❌ RAG initialization failed:', error);
          this.ragService = null;
          this.useRAG = false;
        });
      } catch (error: any) {
        console.error('[HybridImproved] ❌ RAG service creation failed:', error);
        this.ragService = null;
        this.useRAG = false;
      }
    } else {
      this.ragService = null;
      console.log('[HybridImproved] ⚠️ RAG layer disabled');
    }

    // Situational awareness is always enabled
    this.useSituationalAwareness = true;
    console.log('[HybridImproved] ✅ Situational awareness enabled');
  }

  /**
   * Main processing method with intelligent routing
   */
  async processMessage(
    message: string, 
    conversationHistory: ConversationMessage[] = [],
    userId: string = 'anonymous',
    conversationId: string = 'default'
  ): Promise<EnhancedBotResponse> {
    const startTime = Date.now();
    console.log(`\n[HybridImproved] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[HybridImproved] Processing: "${message.substring(0, 60)}..."`);

    try {
      // ═══════════════════════════════════════════════════════════
      // STAGE 1: SITUATIONAL ANALYSIS
      // ═══════════════════════════════════════════════════════════
      let situationalAnalysis: SituationalAnalysis | undefined;
      
      if (this.useSituationalAwareness) {
        situationalAnalysis = this.situationalEngine.analyzeConversation(
          userId,
          conversationId,
          message,
          conversationHistory
        );

        console.log(`[HybridImproved] 🧠 Situational Analysis:`, {
          frustration: `${situationalAnalysis.frustrationLevel}/10`,
          urgency: situationalAnalysis.urgency,
          shouldEscalate: situationalAnalysis.shouldEscalate,
          reasoning: situationalAnalysis.reasoning
        });

        // If situational analysis recommends escalation, do it immediately
        if (situationalAnalysis.shouldEscalate) {
          return {
            response: situationalAnalysis.suggestedResponse || 
              "I understand this needs immediate attention. Let me connect you with our support team right away! 🚀",
            escalate: true,
            urgent: situationalAnalysis.urgency === 'critical' || situationalAnalysis.urgency === 'high',
            confidence: 'high',
            reasoning: situationalAnalysis.reasoning,
            usedAI: false,
            followUp: false,
            situationalAnalysis,
            metrics: {
              route: 'situational',
              processingTimeMs: Date.now() - startTime,
              confidenceScore: 1.0,
              escalationScore: 1.0,
              usedFallback: false
            }
          };
        }
      }

      /*
      // ═══════════════════════════════════════════════════════════
      // STAGE 2: SIMPLE FAQ CHECK (Rule-based)
      // ═══════════════════════════════════════════════════════════
      // DISABLED per user request - always try RAG/AI first
      if (this.isSimpleFAQ(message)) {
        console.log('[HybridImproved] 📋 Route: SIMPLE_FAQ → Rule-based');
        const response = this.ruleBasedBot.processMessage(message, conversationHistory);
        
        return {
          ...response,
          usedAI: false,
          situationalAnalysis,
          metrics: {
            route: 'rule',
            processingTimeMs: Date.now() - startTime,
            confidenceScore: 0.9,
            escalationScore: response.escalate ? 1.0 : 0.0,
            usedFallback: false
          }
        };
      }
      */

      // ═══════════════════════════════════════════════════════════
      // STAGE 3: RAG CACHE CHECK
      // ═══════════════════════════════════════════════════════════
      if (this.useRAG && this.ragService) {
        console.log('[HybridImproved] 🔍 Checking RAG cache...');
        const cachedAnswer = await this.ragService.searchSimilar(message);
        
        if (cachedAnswer && cachedAnswer.similarity >= this.RAG_SIMILARITY_THRESHOLD) {
          console.log(`[HybridImproved] 💚 RAG HIT! Similarity: ${(cachedAnswer.similarity * 100).toFixed(1)}%`);
          
          return {
            response: cachedAnswer.answer,
            escalate: false,
            urgent: false,
            confidence: cachedAnswer.confidence,
            reasoning: `RAG cache hit (${(cachedAnswer.similarity * 100).toFixed(1)}% similarity)`,
            usedAI: false,
            followUp: false,
            situationalAnalysis,
            metrics: {
              route: 'rag',
              processingTimeMs: Date.now() - startTime,
              ragHit: true,
              ragSimilarity: cachedAnswer.similarity,
              confidenceScore: cachedAnswer.confidence === 'high' ? 0.95 : 0.75,
              escalationScore: 0.0,
              usedFallback: false
            }
          };
        } else if (cachedAnswer) {
          console.log(`[HybridImproved] ⚠️ RAG similarity too low: ${(cachedAnswer.similarity * 100).toFixed(1)}%`);
        } else {
          console.log('[HybridImproved] ❌ RAG MISS');
        }
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 4: AI PROCESSING
      // ═══════════════════════════════════════════════════════════
      if (this.useAI && this.aiBot) {
        console.log(`[HybridImproved] 🤖 Route: AI (${this.provider})`);
        
        const aiResponse = await this.aiBot.processMessage(message, conversationHistory);
        
        // Calculate overall confidence score
        const confidenceScore = this.calculateConfidenceScore(aiResponse);
        const escalationScore = this.calculateEscalationScore(aiResponse, situationalAnalysis);

        console.log(`[HybridImproved] 📊 AI Metrics:`, {
          confidence: aiResponse.confidence,
          confidenceScore: confidenceScore.toFixed(2),
          escalationScore: escalationScore.toFixed(2),
          shouldEscalate: aiResponse.escalate
        });

        // If AI confidence is low, try rule-based fallback
        if (confidenceScore < this.LOW_CONFIDENCE_THRESHOLD) {
          console.log('[HybridImproved] ⚠️ Low AI confidence, checking rule-based fallback...');
          
          const ruleResponse = this.ruleBasedBot.processMessage(message, conversationHistory);
          
          // If rules found a match, use it
          if (ruleResponse.matchedIntent && ruleResponse.matchedIntent !== 'unknown') {
            console.log('[HybridImproved] ✅ Using rule-based fallback');
            
            return {
              ...ruleResponse,
              usedAI: false,
              reasoning: 'Low AI confidence - used rule-based fallback',
              situationalAnalysis,
              metrics: {
                route: 'rule',
                processingTimeMs: Date.now() - startTime,
                confidenceScore: 0.8,
                escalationScore: ruleResponse.escalate ? 1.0 : 0.0,
                usedFallback: true
              }
            };
          } else {
            // No rule match, but AI confidence is low - escalate
            console.log('[HybridImproved] ⚠️ No rule fallback available, escalating');
            aiResponse.escalate = true;
            aiResponse.response = "I want to make sure you get the best help. Let me connect you with our support team! 🙌";
          }
        }

        // Store high-confidence responses in RAG
        if (this.useRAG && 
            this.ragService && 
            confidenceScore >= 0.85 && 
            !aiResponse.escalate &&
            aiResponse.confidence !== 'low') {
          
          console.log('[HybridImproved] 💾 Storing in RAG cache...');
          await this.ragService.storeAnswer(message, aiResponse.response, {
            confidence: aiResponse.confidence === 'high' ? 'high' : 'medium' as 'high' | 'low'
          });
        }

        return {
          ...aiResponse,
          situationalAnalysis,
          metrics: {
            route: 'ai',
            processingTimeMs: Date.now() - startTime,
            confidenceScore,
            escalationScore,
            usedFallback: false
          }
        };
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 5: RULE-BASED FALLBACK (if AI unavailable)
      // ═══════════════════════════════════════════════════════════
      console.log('[HybridImproved] 📋 Route: Rule-based (AI unavailable)');
      const response = this.ruleBasedBot.processMessage(message, conversationHistory);
      
      return {
        ...response,
        usedAI: false,
        situationalAnalysis,
        metrics: {
          route: 'rule',
          processingTimeMs: Date.now() - startTime,
          confidenceScore: response.matchedIntent ? 0.8 : 0.5,
          escalationScore: response.escalate ? 1.0 : 0.0,
          usedFallback: false
        }
      };

    } catch (error) {
      console.error('[HybridImproved] ❌ Critical error:', error);
      
      // ═══════════════════════════════════════════════════════════
      // STAGE 6: FAILSAFE
      // ═══════════════════════════════════════════════════════════
      return {
        response: "I'm experiencing technical difficulties. Let me connect you with our support team who can help immediately! 🔧",
        escalate: true,
        urgent: false,
        confidence: 'high',
        reasoning: 'System error - failsafe escalation',
        usedAI: false,
        followUp: false,
        metrics: {
          route: 'failsafe',
          processingTimeMs: Date.now() - startTime,
          confidenceScore: 1.0,
          escalationScore: 1.0,
          usedFallback: true
        }
      };
    }
  }

  /**
   * Check if message is a simple FAQ that can be handled by rules
   */
  private isSimpleFAQ(message: string): boolean {
    const wordCount = message.trim().split(/\s+/).length;
    
    // Long queries should go to AI/RAG for better context understanding
    if (wordCount > 5) {
      return false;
    }

    const simpleFAQPatterns = [
      /^(hi|hello|hey|salam)$/i,
      /^(thank|thanks)$/i,
      /^(refund)$/i,
      /^(wallet)$/i,
      /^(tickets?)$/i,
      /^(safe|safety|secure)$/i,
      /^(host)$/i,
    ];

    return simpleFAQPatterns.some(pattern => pattern.test(message.trim()));
  }

  /**
   * Calculate overall confidence score (0-1)
   */
  private calculateConfidenceScore(response: BotResponse): number {
    const confidenceMap = {
      'high': 0.95,
      'medium': 0.75,
      'low': 0.5
    };

    let baseScore = confidenceMap[response.confidence || 'medium'];

    // Adjust based on response characteristics
    if (response.escalate) {
      // Escalation is a confident decision
      baseScore = Math.max(baseScore, 0.9);
    }

    if (response.response.length < 30) {
      // Very short responses might be uncertain
      baseScore *= 0.9;
    }

    return Math.min(Math.max(baseScore, 0), 1);
  }

  /**
   * Calculate escalation score (0-1) combining AI + situational signals
   */
  private calculateEscalationScore(
    response: BotResponse, 
    situational?: SituationalAnalysis
  ): number {
    let score = 0;

    // AI escalation signal
    if (response.escalate) {
      score += 0.6;
    }

    if (response.urgent) {
      score += 0.2;
    }

    // Situational escalation signals
    if (situational) {
      if (situational.shouldEscalate) {
        score += 0.4;
      }

      // Urgency contribution
      const urgencyScores = {
        'critical': 0.4,
        'high': 0.3,
        'medium': 0.15,
        'low': 0.0
      };
      score += urgencyScores[situational.urgency];

      // Frustration contribution
      score += (situational.frustrationLevel / 10) * 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get comprehensive statistics
   */
  async getStats() {
    const ragStats = this.useRAG && this.ragService
      ? await this.ragService.getStats()
      : { totalQuestions: 0, hitRate: 0, avgSimilarity: 0 };

    return {
      provider: this.provider,
      aiEnabled: this.useAI,
      ragEnabled: this.useRAG,
      situationalAwarenessEnabled: this.useSituationalAwareness,
      thresholds: {
        ragSimilarity: this.RAG_SIMILARITY_THRESHOLD,
        lowConfidence: this.LOW_CONFIDENCE_THRESHOLD,
        escalation: this.ESCALATION_SCORE_THRESHOLD
      },
      ragStats
    };
  }

  /**
   * Clear conversation context (call when conversation ends)
   */
  clearConversationContext(userId: string, conversationId: string): void {
    this.situationalEngine.clearContext(userId, conversationId);
    console.log(`[HybridImproved] Cleared context for user:${userId} conv:${conversationId}`);
  }

  /**
   * Manually mark RAG answer quality (for feedback loop)
   */
  async markAnswerQuality(questionId: string, wasHelpful: boolean): Promise<void> {
    if (this.ragService) {
      await this.ragService.markAnswerQuality(questionId, wasHelpful);
    }
  }
}

export default HybridChatbotImproved;
export { EnhancedBotResponse, ProcessingMetrics };