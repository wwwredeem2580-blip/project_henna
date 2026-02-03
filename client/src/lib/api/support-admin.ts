import api from './client';

export interface SupportConversation {
  _id: string;
  userId?: string;
  userName: string;
  status: 'bot' | 'escalated' | 'active' | 'closed';
  urgent: boolean;
  messages: any[];
  agentId?: string;
  agentName?: string;
  agentJoinedAt?: string;
  escalatedAt?: string;
  createdAt: string;
  metadata?: any;
}

export const adminSupportService = {
  // Get escalated/active conversations
  getQueue: async () => {
    const response = await api.get<{ conversations: SupportConversation[] }>('/api/support/conversation/queue');
    return response.conversations;
  },

  // Close conversation
  closeConversation: async (id: string, notes?: string) => {
    const response = await api.patch<{ message: string, conversation: SupportConversation }>(`/api/support/conversation/${id}/close`, { notes });
    return response;
  },

  // Get stats
  getStats: async () => {
    const response = await api.get<{ stats: any }>('/api/support/conversation/stats');
    return response.stats;
  }
};
