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
  userName: string;
  status: 'bot' | 'escalated' | 'active' | 'closed';
  messages: IMessage[];
  escalatedAt?: Date;
  urgent: boolean;
  agentId?: mongoose.Types.ObjectId;
  agentName?: string;
  agentJoinedAt?: Date;
  closedAt?: Date;
  metadata: {
    language?: string;
    userAgent?: string;
    source?: string; // 'web', 'mobile', 'whatsapp'
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
  userName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['bot', 'escalated', 'active', 'closed'],
    default: 'bot'
  },
  messages: [messageSchema],
  escalatedAt: Date,
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
  metadata: {
    language: String,
    userAgent: String,
    source: String
  }
}, {
  timestamps: true
});

// Index for quick lookups
supportConversationSchema.index({ userId: 1, status: 1 });
supportConversationSchema.index({ status: 1, escalatedAt: -1 });
supportConversationSchema.index({ createdAt: -1 });

export default supportConversationSchema;
