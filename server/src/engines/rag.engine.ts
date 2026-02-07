import { ChromaClient, Collection } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CachedAnswer {
  id: string;
  question: string;
  answer: string;
  similarity: number;
  confidence: 'high' | 'low';
  timestamp: Date;
  usageCount: number;
}

interface RAGStats {
  totalQuestions: number;
  hitRate: number;
  avgSimilarity: number;
}

class RAGService {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private genAI?: GoogleGenerativeAI;
  private embeddingModel?: any;
  private similarityThreshold: number;
  private cacheTTLDays: number;

  constructor(
    chromaHost: string = 'localhost',
    chromaPort: number = 8000,
    geminiApiKey?: string,
    similarityThreshold: number = 0.85,
    cacheTTLDays: number = 30
  ) {
    // ChromaDB JS client requires HTTP server
    this.client = new ChromaClient({
      path: `http://${chromaHost}:${chromaPort}`
    });

    this.similarityThreshold = similarityThreshold;
    this.cacheTTLDays = cacheTTLDays;

    // Initialize Gemini for embeddings (free tier)
    if (geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(geminiApiKey);
      // Use the correct embedding model name for v1beta API
      this.embeddingModel = this.genAI.getGenerativeModel({ 
        model: "gemini-embedding-001" 
      });
      console.log('[RAG] Using Gemini embedding-001 (free tier)');
    } else {
      console.warn('[RAG] No Gemini API key provided - embeddings disabled');
    }
  }

  async initialize(): Promise<void> {
    try {
      // Try to get existing collection
      try {
        this.collection = await this.client.getCollection({
          name: 'support_qa'
        });
        console.log('[RAG] Found existing ChromaDB collection');
      } catch (error) {
        // Collection doesn't exist, create new one
        this.collection = await this.client.createCollection({
          name: 'support_qa',
          metadata: {
            description: 'Support chatbot Q&A cache',
            'hnsw:space': 'cosine' // Use cosine similarity
          }
        });
        console.log('[RAG] Created new ChromaDB collection (custom embeddings)');
      }
    } catch (error) {
      console.error('[RAG] Failed to initialize ChromaDB:', error);
      throw error;
    }
  }

  async searchSimilar(question: string): Promise<CachedAnswer | null> {
    if (!this.collection) {
      console.warn('[RAG] Collection not initialized');
      return null;
    }

    if (!this.embeddingModel) {
      console.warn('[RAG] Embedding model not initialized');
      return null;
    }

    try {
      // Generate embedding for the question
      const embedding = await this.generateEmbedding(question);
      
      if (!embedding) {
        return null;
      }

      // Search for similar questions
      const results = await this.collection.query({
        queryEmbeddings: [embedding],
        nResults: 5  // Get more results to debug
      });

      console.log(`[RAG] Query results:`, {
        ids: results.ids,
        distances: results.distances,
        documents: results.documents?.length,
        metadatas: results.metadatas?.length
      });

      // Check if we have results
      if (!results.ids[0] || results.ids[0].length === 0) {
        console.log('[RAG] No similar questions found');
        return null;
      }

      const similarity = 1 - (results.distances?.[0]?.[0] || 1); // Convert distance to similarity
      const metadata = results.metadatas?.[0]?.[0];
      const document = results.documents?.[0]?.[0];

      // Check similarity threshold
      if (similarity < this.similarityThreshold) {
        console.log(`[RAG] Similarity too low: ${similarity.toFixed(3)} < ${this.similarityThreshold}`);
        return null;
      }

      // Check cache age
      const timestamp = metadata?.timestamp ? new Date(metadata.timestamp as string) : new Date();
      const ageInDays = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
      
      if (ageInDays > this.cacheTTLDays) {
        console.log(`[RAG] Cache expired: ${ageInDays.toFixed(1)} days > ${this.cacheTTLDays}`);
        return null;
      }

      // Update usage count
      await this.incrementUsageCount(results.ids[0][0]);

      console.log(`[RAG] Cache HIT! Similarity: ${similarity.toFixed(3)}`);

      return {
        id: results.ids[0][0],
        question: metadata?.question as string || '',
        answer: document || '',
        similarity: similarity,
        confidence: metadata?.confidence as 'high' | 'low' || 'high',
        timestamp: timestamp,
        usageCount: (metadata?.usageCount as number || 0) + 1
      };

    } catch (error) {
      console.error('[RAG] Search error:', error);
      return null;
    }
  }

  async storeAnswer(
    question: string,
    answer: string,
    metadata: {
      confidence?: 'high' | 'low';
      language?: string;
    } = {}
  ): Promise<void> {
    if (!this.collection) {
      console.warn('[RAG] Collection not initialized');
      return;
    }

    if (!this.embeddingModel) {
      console.warn('[RAG] Embedding model not initialized');
      return;
    }

    try {
      // Don't cache low-confidence or time-sensitive answers
      if (metadata.confidence === 'low') {
        console.log('[RAG] Skipping low-confidence answer');
        return;
      }

      // Don't cache if question is too specific (contains event IDs, dates, etc.)
      if (this.isTimeSpecific(question)) {
        console.log('[RAG] Skipping time-specific question');
        return;
      }

      // Generate embedding
      const embedding = await this.generateEmbedding(question);
      
      if (!embedding) {
        return;
      }

      // Store in ChromaDB
      const id = `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.collection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [answer],
        metadatas: [{
          question: question,
          confidence: metadata.confidence || 'high',
          language: metadata.language || 'en',
          timestamp: new Date().toISOString(),
          usageCount: 0,
          lastUsed: new Date().toISOString(),
          helpfulCount: 0,
          unhelpfulCount: 0,
          qualityScore: 1.0 // Start with perfect score
        }]
      });

      console.log('[RAG] Stored new Q&A pair');

      // Debug: Check collection count after storing
      const count = await this.collection.count();
      console.log(`[RAG] Collection now has ${count} items`);

    } catch (error) {
      console.error('[RAG] Store error:', error);
    }
  }

  private async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.embeddingModel) {
      console.warn('[RAG] Embedding model not initialized');
      return null;
    }

    try {
      // Simple embedContent call without taskType
      const result = await this.embeddingModel.embedContent(text);
      const embedding = result.embedding.values;
      
      // Debug: log embedding info
      console.log(`[RAG] Generated embedding for "${text.substring(0, 50)}..." - Length: ${embedding.length}, First 3 values: [${embedding.slice(0, 3).join(', ')}]`);
      
      return embedding;
    } catch (error) {
      console.error('[RAG] Embedding generation error:', error);
      return null;
    }
  }

  private async incrementUsageCount(id: string): Promise<void> {
    try {
      const result = await this.collection?.get({ ids: [id] });
      
      if (result && result.metadatas && result.metadatas[0]) {
        const metadata = result.metadatas[0];
        const newUsageCount = ((metadata.usageCount as number) || 0) + 1;

        await this.collection?.update({
          ids: [id],
          metadatas: [{
            ...metadata,
            usageCount: newUsageCount,
            lastUsed: new Date().toISOString()
          }]
        });
      }
    } catch (error) {
      console.error('[RAG] Failed to increment usage count:', error);
    }
  }

  private isTimeSpecific(question: string): boolean {
    const timePatterns = [
      // Temporal references
      /\b(today|tomorrow|yesterday|tonight|this\s+(week|month|year|weekend))\b/i,
      /\b(next|last|previous)\s+(week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      
      // Date patterns
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/, // Dates like 12/25/2024
      /\b(20\d{2})\b/, // Years like 2024, 2025
      
      // Event/Ticket specific identifiers
      /\b(event|ticket|order)\s*id\s*[:\-]?\s*\w+\b/i,
      /\b(event|ticket|order)\s*#\s*\w+\b/i,
      
      // Time-sensitive queries
      /\b(current|latest|recent|upcoming|ongoing)\s+(event|ticket|offer|promotion)\b/i,
      /\b(now|right\s+now|at\s+the\s+moment|currently)\b/i,
      /\b(available|happening)\s+(now|today|tonight)\b/i,
      
      // Price/availability queries (often time-sensitive)
      /\b(how\s+much|price|cost).*\b(now|today|currently)\b/i,
      /\b(is|are)\s+.*\s+(available|sold\s+out)\b/i,
      
      // Specific event names with dates (heuristic: contains both event-like words and numbers)
      /\b(concert|festival|conference|workshop|seminar|meetup).*\d{1,2}\b/i,
    ];

    return timePatterns.some(pattern => pattern.test(question));
  }

  async markAnswerQuality(questionId: string, wasHelpful: boolean): Promise<void> {
    if (!this.collection) return;

    try {
      const result = await this.collection.get({ ids: [questionId] });
      
      if (result && result.metadatas && result.metadatas[0]) {
        const metadata = result.metadatas[0];
        const helpfulCount = (metadata.helpfulCount as number) || 0;
        const unhelpfulCount = (metadata.unhelpfulCount as number) || 0;

        await this.collection.update({
          ids: [questionId],
          metadatas: [{
            ...metadata,
            helpfulCount: wasHelpful ? helpfulCount + 1 : helpfulCount,
            unhelpfulCount: !wasHelpful ? unhelpfulCount + 1 : unhelpfulCount,
            qualityScore: wasHelpful 
              ? Math.min(1.0, ((helpfulCount + 1) / (helpfulCount + unhelpfulCount + 1)))
              : ((helpfulCount) / (helpfulCount + unhelpfulCount + 1))
          }]
        });

        console.log(`[RAG] Updated quality for ${questionId}: ${wasHelpful ? '👍' : '👎'}`);
      }
    } catch (error) {
      console.error('[RAG] Failed to mark answer quality:', error);
    }
  }

  async getStats(): Promise<RAGStats> {
    if (!this.collection) {
      return { totalQuestions: 0, hitRate: 0, avgSimilarity: 0 };
    }

    try {
      const count = await this.collection.count();
      
      // Calculate hit rate from metadata
      const allItems = await this.collection.get();
      const totalUsage = allItems.metadatas?.reduce((sum: number, meta: any) => 
        sum + ((meta?.usageCount as number) || 0), 0
      ) || 0;

      const hitRate = count > 0 ? (totalUsage / count) : 0;

      return {
        totalQuestions: count,
        hitRate: hitRate,
        avgSimilarity: 0.9 // Placeholder - would need to track this separately
      };
    } catch (error) {
      console.error('[RAG] Failed to get stats:', error);
      return { totalQuestions: 0, hitRate: 0, avgSimilarity: 0 };
    }
  }

  async seedDatabase(qaList: Array<{ question: string; answer: string }>): Promise<void> {
    console.log(`[RAG] Seeding database with ${qaList.length} Q&A pairs...`);
    
    for (const qa of qaList) {
      await this.storeAnswer(qa.question, qa.answer, { confidence: 'high' });
    }

    console.log('[RAG] Seeding complete');
  }
}

export default RAGService;
export { CachedAnswer, RAGStats };
