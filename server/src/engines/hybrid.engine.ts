import GeminiChatbot, { BotResponse, ConversationMessage } from './gemini.engine';
import OllamaChatbot from './ollama.engine';
import ChatbotEngine from './chatbot.engine';
import RAGService from './rag.engine';

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

class HybridChatbot {
  private aiBot: GeminiChatbot | OllamaChatbot | null;
  private ruleBasedBot: ChatbotEngine;
  private ragService: RAGService | null;
  private provider: AIProvider;
  private useAI: boolean;
  private useRAG: boolean;

  // Simple FAQ patterns that don't need AI
  private simpleFAQPatterns: RegExp[] = [
    /\b(hi|hello|hey|greetings|salam|assalamualaikum)\b/i,
    /\b(refund|money\s*back)\b/i,
    /\b(how.*host|create.*event|host.*event)\b/i,
    /\b(safe|secure|verification)\b/i,
    /\b(ticket.*download|pdf|wallet)\b/i,
    /\b(free.*ticket|claim.*ticket)\b/i,
    /\b(thank|thanks|thx)\b/i,
    /^(nothing|no|nope)$/i
  ];

  constructor(provider: AIProvider = 'gemini', config?: ProviderConfig, chromaHost?: string, chromaPort?: number) {
    // Initialize rule-based bot (always available as fallback)
    this.ruleBasedBot = new ChatbotEngine();
    this.provider = provider;

    // Initialize AI bot based on provider
    this.useAI = false;
    this.aiBot = null;

    switch (provider) {
      case 'gemini':
        if (config?.gemini?.apiKey) {
          try {
            this.aiBot = new GeminiChatbot(config.gemini.apiKey);
            this.useAI = true;
            console.log('[HybridChatbot] Gemini AI enabled');
          } catch (error) {
            console.error('[HybridChatbot] Failed to initialize Gemini:', error);
          }
        }
        break;

      case 'ollama':
        if (config?.ollama) {
          try {
            this.aiBot = new OllamaChatbot(
              config.ollama.baseUrl || 'http://localhost:11434',
              config.ollama.model || 'qwen2.5-coder:7b'
            );
            this.useAI = true;
            console.log('[HybridChatbot] Ollama AI enabled');
          } catch (error) {
            console.error('[HybridChatbot] Failed to initialize Ollama:', error);
          }
        }
        break;

      case 'claude':
        // Claude implementation can be added later
        console.log('[HybridChatbot] Claude AI not yet implemented');
        break;
    }

    if (!this.useAI) {
      console.log('[HybridChatbot] Using rule-based bot only');
    }

    // Initialize RAG service (requires Gemini for embeddings)
    this.useRAG = !!chromaHost && !!config?.gemini?.apiKey;

    if (this.useRAG && chromaHost && config?.gemini?.apiKey) {
      try {
        this.ragService = new RAGService(
          chromaHost,
          chromaPort || 8000,
          config.gemini.apiKey,
          0.85, // similarity threshold
          30    // cache TTL days
        );

        // Initialize async
        this.ragService.initialize().then(() => {
          console.log('[HybridChatbot] RAG layer enabled (Gemini embeddings)');
        }).catch((error: any) => {
          console.error('[HybridChatbot] Failed to initialize RAG:', error);
          this.ragService = null;
          this.useRAG = false;
        });
      } catch (error: any) {
        console.error('[HybridChatbot] Failed to create RAG service:', error);
        this.ragService = null;
        this.useRAG = false;
      }
    } else {
      this.ragService = null;
      console.log('[HybridChatbot] RAG layer disabled');
    }
  }

  async processMessage(message: string, conversationHistory: ConversationMessage[] = []): Promise<BotResponse> {
    try {
      // Step 1: Check if it's a simple FAQ that can be handled by rules
      if (this.isSimpleFAQ(message)) {
        console.log('[HybridChatbot] Routing to rule-based (simple FAQ)');
        return this.processWithRules(message, conversationHistory);
      }

      // Step 2: Try RAG cache (NEW)
      if (this.useRAG && this.ragService) {
        console.log('[HybridChatbot] Checking RAG cache...');
        const cachedAnswer = await this.ragService.searchSimilar(message);
        
        if (cachedAnswer) {
          console.log(`[HybridChatbot] RAG HIT! Similarity: ${cachedAnswer.similarity.toFixed(3)}`);
          return {
            response: cachedAnswer.answer,
            escalate: false,
            urgent: false,
            confidence: cachedAnswer.confidence,
            usedAI: false,
            usedRAG: true,
            similarity: cachedAnswer.similarity
          } as BotResponse & { usedRAG?: boolean; similarity?: number };
        }
        
        console.log('[HybridChatbot] RAG MISS - proceeding to Gemini');
      }

      // Step 3: If AI is available, use it for complex queries
      if (this.useAI && this.aiBot) {
        console.log(`[HybridChatbot] Routing to ${this.provider} AI`);
        const aiResponse = await this.aiBot.processMessage(message, conversationHistory);

        // Store in RAG for future use (if high confidence - RAG uses Gemini for embeddings but stores answers from any provider)
        if (this.useRAG && this.ragService && aiResponse.confidence === 'high') {
          console.log(`[HybridChatbot] Storing answer in RAG: "${message}" -> "${aiResponse.response.substring(0, 50)}..."`);
          await this.ragService.storeAnswer(message, aiResponse.response, {
            confidence: aiResponse.confidence
          });
        } else if (this.useRAG && this.ragService) {
          console.log(`[HybridChatbot] Not storing in RAG - confidence: ${aiResponse.confidence}`);
        }

        // If AI response has low confidence, consider using rules as backup
        if (aiResponse.confidence === 'low' && this.canRulesHandle(message)) {
          console.log('[HybridChatbot] AI confidence low, trying rules');
          const ruleResponse = this.processWithRules(message, conversationHistory);

          // If rules found a match, use it; otherwise stick with AI
          if (ruleResponse.matchedIntent && ruleResponse.matchedIntent !== 'unknown') {
            return { ...ruleResponse, usedAI: false };
          }
        }

        return aiResponse;
      }

      // Step 4: Fallback to rule-based if AI not available
      console.log(`[HybridChatbot] Routing to rule-based (${this.provider} unavailable)`);
      return this.processWithRules(message, conversationHistory);

    } catch (error) {
      console.error('[HybridChatbot] Error processing message:', error);
      
      // Final fallback to rules
      return this.processWithRules(message, conversationHistory);
    }
  }

  private isSimpleFAQ(message: string): boolean {
    // Check if message matches any simple FAQ pattern
    return this.simpleFAQPatterns.some(pattern => pattern.test(message));
  }

  private canRulesHandle(message: string): boolean {
    // Check if rule-based bot has patterns for this message
    // This is a simple check - we'll see if it matches any pattern
    const testResponse = this.ruleBasedBot.processMessage(message, []);
    return testResponse.matchedIntent !== 'unknown';
  }

  private processWithRules(message: string, conversationHistory: ConversationMessage[]): BotResponse {
    const response = this.ruleBasedBot.processMessage(message, conversationHistory);
    return {
      ...response,
      usedAI: false
    };
  }

  // Get stats about routing decisions (useful for monitoring)
  async getStats() {
    const ragStats = this.useRAG && this.ragService
      ? await this.ragService.getStats()
      : { totalQuestions: 0, hitRate: 0, avgSimilarity: 0 };

    return {
      provider: this.provider,
      aiEnabled: this.useAI,
      ragEnabled: this.useRAG,
      simpleFAQPatterns: this.simpleFAQPatterns.length,
      ragStats: ragStats
    };
  }
}

export default HybridChatbot;
