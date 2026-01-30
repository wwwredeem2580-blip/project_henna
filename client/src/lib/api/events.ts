import { apiClient } from './client';

interface EventDraftResponse {
  eventId: string;
  message: string;
}

interface EventData {
  title: string;
  tagline: string;
  category: string;
  subCategory: string[];
  description: string;
  media: {
    coverImage: {
      url: string;
      alt: string;
      thumbnailUrl: string;
    };
  };
  schedule: {
    startDate: string;
    endDate: string;
    isMultiDay: boolean;
    timezone: string;
    doors: string;
    type: 'single' | 'multiple';
    sessions: any[];
  };
  venue: {
    name: string;
    address: {
      street: string;
      city: string;
    };
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
    capacity: number;
    type: 'indoor' | 'outdoor' | 'hybrid';
  };
  verification: {
    documents: Array<{
      type: string;
      url: string;
      filename: string;
      objectKey: string;
    }>;
  };
  tickets: Array<{
    name: string;
    price: {
      amount: number;
      currency: string;
    };
    quantity: number;
    wristbandColor: string;
    isVisible: boolean;
    isActive: boolean;
    benefits: string[];
    tier: string;
  }>;
  platform: {
    terms: {
      termsAccepted: boolean;
      legalPermissionAccepted: boolean;
      platformTermsAccepted: boolean;
    };
  };
}

class EventsService {
  /**
   * Create a new event draft
   */
  async createDraft(data: Partial<EventData>): Promise<EventDraftResponse> {
    return await apiClient.post('/api/event/host', data);
  }

  /**
   * Update an existing event draft
   */
  async updateDraft(eventId: string, data: EventData): Promise<EventDraftResponse> {
    return await apiClient.put(`/api/event/host/draft/${eventId}`, data);
  }

  /**
   * Get event draft by ID
   */
  async getDraft(eventId: string): Promise<any> {
    return await apiClient.get(`/api/event/host/draft/${eventId}`);
  }

  /**
   * Submit event for approval
   */
  async submitEvent(eventId: string, data: Partial<EventData>): Promise<any> {
    return await apiClient.post(`/api/event/host/submit/${eventId}`, data);
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    return await apiClient.delete(`/api/event/host/${eventId}`);
  }
}

export const eventsService = new EventsService();
export type { EventData, EventDraftResponse };
