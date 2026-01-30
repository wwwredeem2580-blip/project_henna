import { apiClient } from './client';

interface EventDraftResponse {
  eventId: string;
  message: string;
}

interface EventData {
  eventId: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  venueName: string;
  coverImage: string;
  totalTickets: number;
  ticketsSold: number;
  ticketsSoldPercentage: number;
  revenue: number;
  orders: number;
  conversionRate: number;
  avgOrderValue: number;
  updatedAt: string;
}

export interface HostEventsResponse {
  events: EventData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


class HostEventsService {
  /**
   * Get all host events
   */
  async getHostEvents({ limit, page, filters }: { limit: number; page: number; filters: { status?: string; search?: string } }): Promise<HostEventsResponse> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (page) queryParams.append('page', page.toString());
    if (filters?.status) queryParams.append('status', filters.status.toString());
    if (filters?.search) queryParams.append('search', filters.search.toString());
    return await apiClient.get(`/api/host/event?${queryParams}`);
  }


  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<any> {
    return await apiClient.get(`/api/host/event/${eventId}`);
  }

  /**
   * Publish an event
   */
  async publishEvent(eventId: string): Promise<void> {
    return await apiClient.put(`/api/host/event/${eventId}/publish`);
  }
}

export const hostEventsService = new HostEventsService();
export type { EventData, EventDraftResponse };
