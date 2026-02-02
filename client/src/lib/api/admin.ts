import { apiClient } from './client';

export interface AdminEventFilters {
  status?: string;
  search?: string;
}

export interface AdminEvent {
  eventId: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  ticketsSoldPercentage: number;
  revenue: number;
  totalTickets: number;
  ticketsSold: number;
  hostName?: string; // Optional, if populated
  hostEmail?: string; // Optional
  isFeatured: boolean;
  isSuspended: boolean;
  isSalesPaused: boolean;
  visibility: 'public' | 'private' | 'unlisted';
}

export interface AdminEventsResponse {
  events: AdminEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AdminService {
  /**
   * Get all events with filters and pagination
   */
  async getEvents({
    page,
    limit,
    filters,
  }: {
    page: number;
    limit: number;
    filters?: AdminEventFilters;
  }): Promise<AdminEventsResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

    const response = await apiClient.get<any>(`/api/admin/event?${queryParams}`);
    
    // Transform backend data to frontend interface
    const mappedEvents = response.events.map((event: any) => this.mapEventData(event));

    return {
      events: mappedEvents,
      pagination: response.pagination,
    };
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<AdminEvent> {
    const response = await apiClient.get<any>(`/api/admin/event/${eventId}`);
    return this.mapEventData(response.event);
  }

  /**
   * Approve event
   */
  async approveEvent(eventId: string): Promise<any> {
    return await apiClient.put(`/api/admin/event/approve/${eventId}`);
  }

  /**
   * Reject event
   */
  async rejectEvent(eventId: string, reason: string): Promise<any> {
    return await apiClient.put(`/api/admin/event/reject/${eventId}`, { rejectionReason: reason });
  }

  /**
   * Suspend event
   */
  async suspendEvent(eventId: string, reason: string): Promise<any> {
    return await apiClient.put(`/api/admin/event/suspend/${eventId}`, { reason });
  }

  /**
   * Unsuspend event
   */
  async unsuspendEvent(eventId: string): Promise<any> {
    return await apiClient.put(`/api/admin/event/unsuspend/${eventId}`);
  }

  /**
   * Feature event
   */
  async featureEvent(eventId: string, priority: number = 0): Promise<any> {
    return await apiClient.put(`/api/admin/event/feature/${eventId}`, { priority });
  }

  /**
   * Unfeature event
   */
  async unfeatureEvent(eventId: string): Promise<any> {
    return await apiClient.put(`/api/admin/event/unfeature/${eventId}`);
  }

  /**
   * Toggle sales pause
   */
  async toggleSales(eventId: string): Promise<any> {
    return await apiClient.put(`/api/admin/event/toggle-sales/${eventId}`);
  }

  /**
   * Toggle visibility
   */
  async toggleVisibility(eventId: string): Promise<any> {
    return await apiClient.put(`/api/admin/event/toggle-visibility/${eventId}`);
  }

  /**
   * Withdraw approved event
   */
  async withdrawEvent(eventId: string): Promise<any> {
    return await apiClient.put(`/api/admin/event/withdraw/${eventId}`);
  }

  /**
   * Delete event (Permanent)
   */
  async deleteEvent(eventId: string): Promise<any> {
    return await apiClient.delete(`/api/admin/event/${eventId}`);
  }

  /**
   * Helper to map backend event structure to frontend AdminEvent interface
   */
  private mapEventData(event: any): AdminEvent {
    // Calculate tickets sold percentage
    const totalTickets = event.tickets?.reduce((acc: number, ticket: any) => acc + (ticket.quantity || 0), 0) || 0;
    const ticketsSold = event.metrics?.ticketsSold || 0;
    const percentage = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;

    return {
      eventId: event._id,
      title: event.title,
      status: event.status,
      startDate: event.schedule?.startDate || '',
      endDate: event.schedule?.endDate || '',
      coverImage: event.media?.coverImage?.url || '', // Assuming standard media structure
      ticketsSoldPercentage: percentage,
      revenue: event.metrics?.revenue || 0,
      ticketsSold: ticketsSold,
      totalTickets: totalTickets,
      hostName: event.hostId ? `${event.hostId.firstName} ${event.hostId.lastName}` : undefined,
      hostEmail: event.hostId?.email,
      isFeatured: event.moderation?.featured?.isFeatured || false,
      isSuspended: event.flags?.suspended || false,
      isSalesPaused: event.moderation?.sales?.paused || false,
      visibility: event.moderation?.visibility || 'public',
    };
  }
}

export const adminService = new AdminService();
