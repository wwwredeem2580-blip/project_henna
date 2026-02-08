import { Support } from '../../database/support/support';
import { Server } from 'socket.io';

export class QueueTimeoutService {
  private io: Server;
  private intervalId: NodeJS.Timeout | null = null;
  private userSocketsGetter: () => Map<string, any>;
  
  constructor(io: Server, userSocketsGetter: () => Map<string, any>) {
    this.io = io;
    this.userSocketsGetter = userSocketsGetter;
  }
  
  start() {
    // Check every 30 seconds
    this.intervalId = setInterval(() => {
      this.checkTimeouts();
    }, 30000);
    
    console.log('✅ Queue timeout service started (checking every 30s)');
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Queue timeout service stopped');
    }
  }
  
  private async checkTimeouts() {
    try {
      const FIVE_MINUTES = 5 * 60 * 1000;
      const cutoffTime = new Date(Date.now() - FIVE_MINUTES);
      
      // Find escalated conversations older than 5 minutes
      const timedOutConversations = await Support.find({
        status: 'escalated',
        escalatedAt: { $lt: cutoffTime }
      });
      
      if (timedOutConversations.length === 0) {
        return;
      }
      
      console.log(`⏰ Found ${timedOutConversations.length} timed-out conversations`);
      
      for (const conv of timedOutConversations) {
        // Close conversation
        conv.status = 'timeout';
        conv.closedAt = new Date();
        conv.closedReason = 'timeout';
        await conv.save();
        
        // Notify user if connected
        const userSockets = this.userSocketsGetter();
        const userSocket = userSockets.get(conv._id.toString());
        if (userSocket) {
          userSocket.emit('conversation_closed', {
            message: 'No agents are currently available. This chat has been closed. Please create a new chat or try again later.'
          });
          
          // Remove from userSockets
          userSockets.delete(conv._id.toString());
        }
        
        console.log(`⏰ Conversation ${conv._id} timed out after 5 minutes (no agent joined)`);
      }
      
      // Update queue positions for remaining conversations
      if (timedOutConversations.length > 0) {
        this.notifyQueuePositions();
      }
      
    } catch (error) {
      console.error('❌ Error checking queue timeouts:', error);
    }
  }
  
  private async notifyQueuePositions() {
    try {
      const escalatedConversations = await Support.find({ 
        status: 'escalated' 
      }).sort({ urgent: -1, escalatedAt: 1 });

      const userSockets = this.userSocketsGetter();
      
      escalatedConversations.forEach((conv, index) => {
        const convId = conv._id.toString();
        const userSocket = userSockets.get(convId);
        if (userSocket) {
          userSocket.emit('queue_update', {
            position: index + 1,
            total: escalatedConversations.length
          });
        }
      });

      // Also notify admins about queue count
      this.io.of('/support/admin').to('admin_room').emit('queue_stats', {
        count: escalatedConversations.length
      });

    } catch (error) {
      console.error('Error notifying queue positions:', error);
    }
  }
}
