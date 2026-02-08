import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: Date;
  intent?: string; // matched bot intent
  agentId?: mongoose.Types.ObjectId;
}

export interface ISupportConversation extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for anonymous users
  anonymousId?: string; // For tracking anonymous users across sessions
  userName: string;
  status: 'bot' | 'escalated' | 'active' | 'closed' | 'timeout'; // Added 'timeout' status
  messages: IMessage[];
  escalatedAt?: Date;
  lastActivityAt?: Date; // Track last user activity for timeout detection
  queueJoinedAt?: Date; // When user joined queue (for ordering)
  queueExitedAt?: Date; // When user left queue (refresh/offline)
  urgent: boolean;
  agentId?: mongoose.Types.ObjectId;
  agentName?: string;
  agentJoinedAt?: Date;
  closedAt?: Date;
  closedReason?: string; // 'agent_closed' | 'timeout' | 'user_left'
  metadata: {
    language?: string;
    userAgent?: string;
    source?: string; // 'web', 'mobile', 'whatsapp'
    sessionId?: string; // Browser session ID for anonymous users
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'bot', 'agent'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  intent: String,
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const supportConversationSchema = new Schema<ISupportConversation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous users
  },
  anonymousId: {
    type: String,
    required: false
  },
  userName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['bot', 'escalated', 'active', 'closed', 'timeout'],
    default: 'bot'
  },
  messages: [messageSchema],
  escalatedAt: Date,
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  queueJoinedAt: Date,
  queueExitedAt: Date,
  urgent: {
    type: Boolean,
    default: false
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  agentName: String,
  agentJoinedAt: Date,
  closedAt: Date,
  closedReason: String,
  metadata: {
    language: String,
    userAgent: String,
    source: String,
    sessionId: String
  }
}, {
  timestamps: true
});

// Index for quick lookups
supportConversationSchema.index({ userId: 1, status: 1 });
supportConversationSchema.index({ anonymousId: 1, status: 1 }); // For anonymous user conversations
supportConversationSchema.index({ status: 1, escalatedAt: -1 });
supportConversationSchema.index({ escalatedAt: 1, status: 1 }); // For timeout checks
supportConversationSchema.index({ lastActivityAt: -1 }); // For activity tracking
supportConversationSchema.index({ createdAt: -1 });

export default supportConversationSchema;
