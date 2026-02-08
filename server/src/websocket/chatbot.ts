import { Server, Socket } from 'socket.io';
import HybridChatbotImproved from '../engines/hybrid.engine';
import SituationalAwarenessEngine from '../engines/situational.engine';
import { Support } from '../database/support/support';
import { ConversationMessage } from '../engines/chatbot.engine';
import { QueueTimeoutService } from '../modules/support/queue-timeout';

// Initialize engines
const hybridBot = new HybridChatbotImproved(
  'ollama', // Primary provider
  {
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434',
      model: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q4_K_M'
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

// Helper to broadcast queue positions
const notifyQueuePositions = async (io: Server) => {
  try {
    const escalatedConversations = await Support.find({ 
      status: 'escalated' 
    }).sort({ urgent: -1, escalatedAt: 1 });

    // Calculate average wait time from recent conversations
    const recentConversations = await Support.find({
      agentJoinedAt: { 
        $exists: true,
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      },
      escalatedAt: { $exists: true }
    }).limit(20);

    let avgWaitTimeMs = 2 * 60 * 1000; // Default 2 minutes
    if (recentConversations.length > 0) {
      // Calculate wait times and filter outliers
      const waitTimes = recentConversations.map(conv => {
        return conv.agentJoinedAt!.getTime() - conv.escalatedAt!.getTime();
      }).filter(time => time > 0 && time < 10 * 60 * 1000); // Filter: 0-10 minutes only
      
      if (waitTimes.length > 0) {
        const totalWaitTime = waitTimes.reduce((sum, time) => sum + time, 0);
        avgWaitTimeMs = totalWaitTime / waitTimes.length;
      }
    }

    // Cap at 5 minutes maximum
    avgWaitTimeMs = Math.min(avgWaitTimeMs, 5 * 60 * 1000);

    escalatedConversations.forEach((conv, index) => {
      const convId = conv._id.toString();
      const userSocket = userSockets.get(convId);
      if (userSocket) {
        let estimatedWaitMinutes;
        
        if (index === 0) {
          // Position 1: Show in seconds (30-60 seconds typically)
          estimatedWaitMinutes = 1; // Show "~1 min" for first position
        } else {
          // Other positions: Use average wait time
          estimatedWaitMinutes = Math.ceil(avgWaitTimeMs / 60000);
        }
        
        userSocket.emit('queue_update', {
          position: index + 1,
          total: escalatedConversations.length,
          estimatedWaitMinutes
        });
      }
    });

    // Also notify admins about valid queue count
    io.of('/support/admin').to('admin_room').emit('queue_stats', {
      count: escalatedConversations.length
    });

    // Send full queue list to admins for real-time updates
    io.of('/support/admin').to('admin_room').emit('queue_list_update', {
      queue: escalatedConversations.map((conv, index) => ({
        _id: conv._id.toString(),
        userName: conv.userName,
        userId: conv.userId,
        position: index + 1,
        urgent: conv.urgent,
        status: conv.status,
        escalatedAt: conv.escalatedAt,
        messages: conv.messages
      }))
    });

  } catch (error) {
    console.error('Error notifying queue positions:', error);
  }
};

export const initChatbotSocket = (io: Server) => {
  const supportNamespace = io.of('/support');

  // Initialize and start queue timeout service
  const timeoutService = new QueueTimeoutService(io, () => userSockets);
  timeoutService.start();

  supportNamespace.on('connection', async (socket: Socket) => {
    console.log(`🔌 User connected to support chat: ${socket.id}`);

    const userId = (socket.handshake.query.userId as string) || null;
    const anonymousId = (socket.handshake.query.anonymousId as string) || null;
    const userName = (socket.handshake.query.userName as string) || 'Guest';
    let conversationId: string | null = null;
    let conversation: any = null;

    try {
      // Find existing conversation by userId or anonymousId
      if (userId && userId !== 'anonymous' && !userId.startsWith('guest_')) {
        // Authenticated user
        conversation = await Support.findOne({
          userId,
          status: { $in: ['bot', 'escalated', 'active'] }
        }).sort({ createdAt: -1 });
        console.log(`[Support] Looking for conversation by userId: ${userId}`);
      } else if (anonymousId) {
        // Anonymous user
        conversation = await Support.findOne({
          anonymousId,
          status: { $in: ['bot', 'escalated', 'active'] }
        }).sort({ createdAt: -1 });
        console.log(`[Support] Looking for conversation by anonymousId: ${anonymousId}`);
      }

      if (!conversation) {
        // Create new conversation
        const conversationData: any = {
          userName,
          status: 'bot',
          messages: [],
          urgent: false,
          lastActivityAt: new Date(),
          metadata: {
            source: 'web',
            userAgent: socket.handshake.headers['user-agent'],
            sessionId: anonymousId || userId
          }
        };

        // Add userId or anonymousId
        if (userId && userId !== 'anonymous' && !userId.startsWith('guest_')) {
          conversationData.userId = userId;
        } else if (anonymousId) {
          conversationData.anonymousId = anonymousId;
        }

        conversation = await Support.create(conversationData);
        console.log(`[Support] Created new conversation: ${conversation._id} (anonymous: ${!!anonymousId})`);
        
        // Notify admins about new conversation
        io.of('/support/admin').to('admin_room').emit('new_conversation', {
          conversationId: conversation._id.toString(),
          userId: userId || 'anonymous',
          userName,
          status: 'bot',
          urgent: false,
          preview: 'New conversation started',
          createdAt: conversation.createdAt
        });
      } else {
        console.log(`[Support] Resumed conversation: ${conversation._id} (status: ${conversation.status})`);
      }

      conversationId = conversation._id.toString();
      userSockets.set(conversationId!, socket); // conversationId is guaranteed to be string here

      // Check if user was in queue and handle rejoin logic
      if (conversation.status === 'escalated') {
        const timeSinceLastActivity = Date.now() - (conversation.lastActivityAt?.getTime() || Date.now());
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        if (timeSinceLastActivity > FIVE_MINUTES) {
          // Too long offline - close conversation
          console.log(`[Support] Conversation ${conversationId} expired (offline > 5 min)`);
          conversation.status = 'closed';
          conversation.closedReason = 'user_left';
          conversation.closedAt = new Date();
          await conversation.save();
          
          socket.emit('conversation_closed', {
            message: 'Your previous session expired due to inactivity. Please start a new conversation.'
          });
          
          // Clear from queue
          if (conversationId) {
            userSockets.delete(conversationId);
          }
          notifyQueuePositions(io);
        } else {
          // Rejoin queue at back (fair to those waiting)
          console.log(`[Support] User rejoining queue (was offline ${Math.round(timeSinceLastActivity / 1000)}s)`);
          conversation.queueJoinedAt = new Date(); // Reset queue time (back of queue)
          conversation.lastActivityAt = new Date();
          await conversation.save();
          
          // Notify queue position
          notifyQueuePositions(io);
        }
      }

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
        if (!conversationId) {
          socket.emit('error', { message: 'Conversation not initialized' });
          return;
        }

        try {
          // Refetch conversation to get latest status
          conversation = await Support.findById(conversationId);
          if (!conversation) {
             socket.emit('error', { message: 'Conversation not found' });
             return;
          }

          const userMessage = data.text.trim();
          if (!userMessage) return;

          // Update last activity time
          conversation.lastActivityAt = new Date();

          // Add user message to conversation
          const userMsgObj: ConversationMessage = {
            role: 'user',
            text: userMessage,
            timestamp: new Date()
          };

          conversation.messages.push(userMsgObj);
          await conversation.save();

          // If admin is active, forward message to admin and skip bot
          // Check BOTH status and socket presence for robustness
          if ((conversation.status === 'active' || conversation.status === 'escalated') && adminSockets.has(conversationId)) {
             // Ensure status is active properly if admin is connected
             if (conversation.status !== 'active') {
                 conversation.status = 'active';
                 await conversation.save();
             }
             
            const adminSocket = adminSockets.get(conversationId);
            adminSocket?.emit('user_message', {
              conversationId,
              message: userMsgObj
            });
            return; // Admin will respond, not bot
          }

          // If conversation is escalated (waiting for agent), do not trigger bot
          if (conversation.status === 'escalated') {
              return;
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
          conversation.queueJoinedAt = new Date(); // Track queue join time
          conversation.urgent = analysis.urgency === 'critical' || analysis.urgency === 'high';
          await conversation.save();

          // Notify user
          socket.emit('escalated', {
            message: "I've placed you in our support queue. Please wait calmly, an agent will join you shortly. 🧘‍♂️",
            urgency: analysis.urgency
          });

          // ALSO send a standard message to ensure it appears in chat history
          socket.emit('message', {
            text: "I've detected that this is urgent. Connecting you to an agent immediately... 🚀",
            sender: 'bot',
            timestamp: new Date().toISOString(),
            confidence: 'high',
            usedAI: false
          });

          // Notify all connected admins about new escalation
          supportNamespace.to('admin_room').emit('new_escalation', {
            conversationId,
            userId: userId || 'anonymous',
            userName,
            urgency: analysis.urgency,
            preview: userMessage.substring(0, 100)
          });
          
          notifyQueuePositions(io);

          return;
        }

        // Show typing indicator
        socket.emit('typing', { isTyping: true });

        const botResponse = await hybridBot.processMessage(
          userMessage,
          conversation.messages,
          userIdForContext,
          conversationId
        );

        // Simulate realistic typing delay
        const typingDelay = Math.min(2000, 500 + botResponse.response.length * 15);
        
        setTimeout(async () => {
          // Double check status before responding to ensure admin didn't join during delay
          const currentConv = await Support.findById(conversationId);
          if (currentConv && (currentConv.status === 'active' || currentConv.status === 'escalated')) {
               socket.emit('typing', { isTyping: false });
               return; // Abort bot response
          }

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
            conversation.queueJoinedAt = new Date(); // Track queue join time
            conversation.urgent = botResponse.urgent;
            await conversation.save();

            socket.emit('escalated', {
              message: "I've placed you in our support queue. Please wait calmly, an agent will join you shortly. 🧘‍♂️",
              urgency: botResponse.urgent ? 'high' : 'medium'
            });

            // ALSO send a standard message to ensure it appears in chat history
            socket.emit('message', {
              text: "I'm connecting you with a human agent now. Please wait a moment... ⏳",
              sender: 'bot',
              timestamp: new Date().toISOString(),
              confidence: 'high',
              usedAI: false
            });

            supportNamespace.to('admin_room').emit('new_escalation', {
              conversationId,
              userId: userId || 'anonymous',
              userName,
              urgency: botResponse.urgent ? 'high' : 'medium',
              preview: userMessage.substring(0, 100)
            });

            notifyQueuePositions(io);
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

    // Handle user leaving queue
    socket.on('leave_queue', async () => {
      if (conversationId && conversation) {
        console.log(`[Support] User leaving queue: ${conversationId}`);
        conversation.status = 'closed';
        conversation.closedReason = 'user_left';
        conversation.closedAt = new Date();
        await conversation.save();
        
        userSockets.delete(conversationId);
        notifyQueuePositions(io);
      }
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
        
        // Notify other admins to avoid collision
        socket.to('admin_room').emit('conversation_updated', {
          conversationId: data.conversationId,
          action: 'joined',
          agentName: data.adminName
        });

        notifyQueuePositions(io);

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
        
        // Update other admins
        socket.to('admin_room').emit('conversation_updated', {
          conversationId: data.conversationId,
          action: 'closed'
        });

        notifyQueuePositions(io);
        
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

