import { Server, Socket } from 'socket.io';
import HybridChatbot from '../engines/hybrid.engine';
import SituationalAwarenessEngine from '../engines/situational.engine';
import { Support } from '../database/support/support';
import { ConversationMessage } from '../engines/chatbot.engine';

// Initialize engines
const hybridBot = new HybridChatbot(
  'ollama', // Primary provider
  {
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434',
      model: process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY
    }
  },
  process.env.CHROMA_HOST || 'chromadb', // Use docker-compose service name
  process.env.CHROMA_PORT ? parseInt(process.env.CHROMA_PORT) : 8000
);

const situationalEngine = new SituationalAwarenessEngine();

// Track active admin connections
const adminSockets = new Map<string, Socket>(); // conversationId -> admin socket
const userSockets = new Map<string, Socket>(); // conversationId -> user socket

export const initChatbotSocket = (io: Server) => {
  const supportNamespace = io.of('/support');

  supportNamespace.on('connection', async (socket: Socket) => {
    console.log(`🔌 User connected to support chat: ${socket.id}`);

    const userId = (socket.handshake.query.userId as string) || null;
    const userName = (socket.handshake.query.userName as string) || 'Guest';
    let conversationId: string | null = null;
    let conversation: any = null;

    try {
      // Only find existing conversation if user is authenticated
      if (userId && userId !== 'anonymous') {
        conversation = await Support.findOne({
          userId,
          status: { $in: ['bot', 'escalated', 'active'] }
        }).sort({ createdAt: -1 });
      }

      if (!conversation) {
        // Create new conversation
        const conversationData: any = {
          userName,
          status: 'bot',
          messages: [],
          urgent: false,
          metadata: {
            source: 'web',
            userAgent: socket.handshake.headers['user-agent']
          }
        };

        // Only add userId if user is authenticated
        if (userId && userId !== 'anonymous') {
          conversationData.userId = userId;
        }

        conversation = await Support.create(conversationData);
        console.log(`[Support] Created new conversation: ${conversation._id}`);
      } else {
        console.log(`[Support] Resumed conversation: ${conversation._id}`);
      }

      conversationId = conversation._id.toString();
      userSockets.set(conversationId!, socket); // conversationId is guaranteed to be string here

      // Send conversation history to user
      socket.emit('conversation_history', {
        conversationId,
        messages: conversation.messages,
        status: conversation.status
      });

      // If admin is already in this conversation, notify user
      if (conversation.status === 'active' && conversation.agentName) {
        socket.emit('admin_joined', {
          agentName: conversation.agentName,
          joinedAt: conversation.agentJoinedAt
        });
      }

    } catch (error) {
      console.error('[Support] Error initializing conversation:', error);
      socket.emit('error', { message: 'Failed to initialize conversation' });
      return;
    }

    // Handle user messages
    socket.on('message', async (data: { text: string }) => {
      if (!conversationId || !conversation) {
        socket.emit('error', { message: 'Conversation not initialized' });
        return;
      }

      try {
        const userMessage = data.text.trim();
        if (!userMessage) return;

        // Add user message to conversation
        const userMsgObj: ConversationMessage = {
          role: 'user',
          text: userMessage,
          timestamp: new Date()
        };

        conversation.messages.push(userMsgObj);
        await conversation.save();

        // If admin is active, forward message to admin and skip bot
        if (conversation.status === 'active' && adminSockets.has(conversationId)) {
          const adminSocket = adminSockets.get(conversationId);
          adminSocket?.emit('user_message', {
            conversationId,
            message: userMsgObj
          });
          return; // Admin will respond, not bot
        }

        // Analyze conversation with situational awareness
        const userIdForContext = userId || conversationId; // Use conversationId for anonymous users
        const analysis = situationalEngine.analyzeConversation(
          userIdForContext,
          conversationId,
          userMessage,
          conversation.messages
        );

        console.log(`[SituationalAwareness] ${conversationId}: ${analysis.reasoning}`);

        // Check if auto-escalation is needed
        if (analysis.shouldEscalate && conversation.status === 'bot') {
          conversation.status = 'escalated';
          conversation.escalatedAt = new Date();
          conversation.urgent = analysis.urgency === 'critical' || analysis.urgency === 'high';
          await conversation.save();

          // Notify user
          socket.emit('escalated', {
            message: analysis.suggestedResponse || "I'm connecting you with our support team now...",
            urgency: analysis.urgency
          });

          // Notify all connected admins about new escalation
          supportNamespace.to('admin_room').emit('new_escalation', {
            conversationId,
            userId: userId || 'anonymous',
            userName,
            urgency: analysis.urgency,
            preview: userMessage.substring(0, 100)
          });

          return;
        }

        // Show typing indicator
        socket.emit('typing', { isTyping: true });

        // Process with hybrid bot
        const botResponse = await hybridBot.processMessage(userMessage, conversation.messages);

        // Simulate realistic typing delay
        const typingDelay = Math.min(2000, 500 + botResponse.response.length * 15);
        
        setTimeout(async () => {
          // Add bot response to conversation
          const botMsgObj: ConversationMessage = {
            role: 'bot',
            text: botResponse.response,
            timestamp: new Date()
          };

          conversation.messages.push(botMsgObj);
          await conversation.save();

          // Send response to user
          socket.emit('message', {
            text: botResponse.response,
            sender: 'bot',
            timestamp: new Date().toISOString(),
            confidence: botResponse.confidence,
            usedAI: botResponse.usedAI,
            usedRAG: (botResponse as any).usedRAG
          });

          socket.emit('typing', { isTyping: false });

          // Check if bot suggests escalation
          if (botResponse.escalate && conversation.status === 'bot') {
            conversation.status = 'escalated';
            conversation.escalatedAt = new Date();
            conversation.urgent = botResponse.urgent;
            await conversation.save();

            socket.emit('escalated', {
              message: "Connecting you with our support team...",
              urgency: botResponse.urgent ? 'high' : 'medium'
            });

            supportNamespace.to('admin_room').emit('new_escalation', {
              conversationId,
              userId: userId || 'anonymous',
              userName,
              urgency: botResponse.urgent ? 'high' : 'medium',
              preview: userMessage.substring(0, 100)
            });
          }
        }, typingDelay);

      } catch (error) {
        console.error('[Support] Error processing message:', error);
        socket.emit('error', { message: 'Failed to process your message. Please try again.' });
        socket.emit('typing', { isTyping: false });
      }
    });

    // Handle user feedback on bot responses
    socket.on('feedback', async (data: { messageId: string; helpful: boolean }) => {
      // This can be used to improve RAG quality
      console.log(`[Support] User feedback: ${data.helpful ? '👍' : '👎'} for message ${data.messageId}`);
      // TODO: Implement RAG quality tracking
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      if (conversationId) {
        userSockets.delete(conversationId);
      }
    });
  });

  // Admin namespace for queue management
  const adminNamespace = io.of('/support/admin');

  adminNamespace.on('connection', async (socket: Socket) => {
    console.log(`🔌 Admin connected: ${socket.id}`);

    // Join admin room for notifications
    socket.join('admin_room');

    // Admin requests to join a conversation
    socket.on('join_conversation', async (data: { conversationId: string; adminId: string; adminName: string }) => {
      try {
        const conversation = await Support.findById(data.conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Update conversation status
        conversation.status = 'active';
        conversation.agentId = data.adminId;
        conversation.agentName = data.adminName;
        conversation.agentJoinedAt = new Date();
        await conversation.save();

        // Track admin socket
        adminSockets.set(data.conversationId, socket);

        // Notify user that admin joined
        const userSocket = userSockets.get(data.conversationId);
        if (userSocket) {
          userSocket.emit('admin_joined', {
            agentName: data.adminName,
            joinedAt: new Date()
          });
        }

        // Send conversation history to admin
        socket.emit('conversation_joined', {
          conversationId: data.conversationId,
          conversation
        });

        console.log(`[Support] Admin ${data.adminName} joined conversation ${data.conversationId}`);

      } catch (error) {
        console.error('[Support] Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Admin sends message
    socket.on('admin_message', async (data: { conversationId: string; text: string }) => {
      try {
        const conversation = await Support.findById(data.conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const adminMsg: ConversationMessage = {
          role: 'agent',
          text: data.text,
          timestamp: new Date()
        };

        conversation.messages.push(adminMsg);
        await conversation.save();

        // Send to user
        const userSocket = userSockets.get(data.conversationId);
        if (userSocket) {
          userSocket.emit('message', {
            text: data.text,
            sender: 'agent',
            timestamp: new Date().toISOString()
          });
        }

        // Confirm to admin
        socket.emit('message_sent', { success: true });

      } catch (error) {
        console.error('[Support] Error sending admin message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Admin closes conversation
    socket.on('close_conversation', async (data: { conversationId: string; notes?: string }) => {
      try {
        const conversation = await Support.findById(data.conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        conversation.status = 'closed';
        conversation.closedAt = new Date();
        await conversation.save();

        // Clean up
        adminSockets.delete(data.conversationId);
        const userIdStr = conversation.userId?.toString();
        if (userIdStr) {
          situationalEngine.clearContext(userIdStr, data.conversationId);
        }

        // Notify user
        const userSocket = userSockets.get(data.conversationId);
        if (userSocket) {
          userSocket.emit('conversation_closed', {
            message: 'This conversation has been closed. Feel free to start a new one if you need more help!'
          });
        }

        socket.emit('conversation_closed', { success: true });
        console.log(`[Support] Conversation ${data.conversationId} closed`);

      } catch (error) {
        console.error('[Support] Error closing conversation:', error);
        socket.emit('error', { message: 'Failed to close conversation' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Admin disconnected: ${socket.id}`);
      // Remove from active admin sockets
      for (const [convId, adminSocket] of adminSockets.entries()) {
        if (adminSocket.id === socket.id) {
          adminSockets.delete(convId);
        }
      }
    });
  });
};

