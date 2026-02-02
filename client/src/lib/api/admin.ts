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
  hostId?: string;
  hostName?: string; // Optional, if populated
  hostEmail?: string; // Optional
  isFeatured: boolean;
  isSuspended: boolean;
  isSalesPaused: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  verification?: {
    status: string;
    documents: Array<{
      type: string;
      url?: string;
      filename: string;
      objectKey?: string;
      uploadedAt: string;
      status: 'pending' | 'approved' | 'rejected';
      rejectionReason?: string;
    }>;
  };
  description?: string;
  tagline?: string;
  category?: string;
  venue?: any;
  organizer?: any;
  tickets?: any[];
  media?: any;
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


export interface AdminOrder {
  orderId: string;
  orderNumber: string;
  eventTitle: string;
  buyerEmail: string;
  ticketCount: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminPayout {
  payoutId: string;
  payoutNumber: string;
  eventTitle: string;
  hostName: string;
  hostEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'on_hold' | 'rejected';
  createdAt: string;
  bankName?: string;
  accountNumber?: string;
  paymentMethod: string;
}

export interface AdminPayoutsResponse {
  payouts: AdminPayout[];
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
   * Get all orders with filters and pagination
   */
  async getOrders({
    page,
    limit,
    filters,
  }: {
    page: number;
    limit: number;
    filters?: AdminEventFilters; // Reusing simplified filters for now as they are similar (status, search)
  }): Promise<AdminOrdersResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

    const response = await apiClient.get<any>(`/api/admin/order?${queryParams}`);
    
    // Transform backend data to frontend interface
    const mappedOrders = response.orders.map((order: any) => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      eventTitle: order.eventTitle,
      buyerEmail: order.buyerEmail,
      ticketCount: order.ticketCount,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
    }));

    return {
      orders: mappedOrders,
      pagination: response.pagination,
    };
  }

  /**
   * Refund order
   */
  async refundOrder(orderId: string, amount?: number, reason?: string, refundType: 'full' | 'partial' = 'full'): Promise<any> {
    return await apiClient.put(`/api/admin/order/${orderId}/refund`, { 
      amount, 
      reason,
      refundType
    });
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
      hostId: event.hostId?._id || event.hostId, // Ensure we get the ID string
      hostName: event.hostId ? `${event.hostId.firstName} ${event.hostId.lastName}` : undefined,
      hostEmail: event.hostId?.email,
      isFeatured: event.moderation?.features?.isFeatured || false,
      isSuspended: event.flags?.suspended || false,
      isSalesPaused: event.moderation?.sales?.paused || false,
      visibility: event.moderation?.visibility || 'public',
  verification: event.verification ? {
        status: event.verification.status,
        documents: event.verification.documents?.map((doc: any) => ({
          type: doc.type,
          url: doc.url,
          filename: doc.filename,
          objectKey: doc.objectKey, // Important for secure link fetching
          uploadedAt: doc.uploadedAt,
          status: doc.status,
          rejectionReason: doc.rejectionReason
        })) || []
      } : undefined,
      description: event.description,
      tagline: event.tagline,
      category: event.category,
      venue: event.venue,
      organizer: event.organizer,
      tickets: event.tickets,
      media: event.media
    };
  }

  /**
   * Get verification document link
   */
  async getVerificationDocumentLink(docKey: string): Promise<{ verificationDocumentLink: string }> {
      const response = await apiClient.get<any>(`/api/admin/event/verification-document-link?docKey=${encodeURIComponent(docKey)}`);
      return response; 
  }
  /**
   * Get all payouts with filters and pagination
   */
  async getPayouts({
    page,
    limit,
    filters,
  }: {
    page: number;
    limit: number;
    filters?: AdminEventFilters;
  }): Promise<AdminPayoutsResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

    const response = await apiClient.get<any>(`/api/admin/payout?${queryParams}`);
    
    // Transform backend data to frontend interface
    const mappedPayouts = response.payouts.map((payout: any) => ({
      payoutId: payout._id,
      payoutNumber: payout.payoutNumber,
      eventTitle: payout.eventId?.title || 'Unknown Event',
      hostName: payout.hostId ? `${payout.hostId.firstName} ${payout.hostId.lastName}` : 'Unknown Host',
      hostEmail: payout.hostId?.email,
      amount: payout.netPayout || payout.amount || 0,
      currency: payout.currency || 'BDT',
      status: payout.status,
      createdAt: payout.createdAt,
      bankName: payout.bankName,
      accountNumber: payout.accountNumber,
      paymentMethod: payout.paymentMethod
    }));

    return {
      payouts: mappedPayouts,
      pagination: response.pagination,
    };
  }

  /**
   * Approve payout
   */
  async approvePayout(payoutId: string, notes?: string): Promise<any> {
    return await apiClient.put(`/api/admin/payout/${payoutId}/approve`, { notes });
  }

  /**
   * Reject payout
   */
  async rejectPayout(payoutId: string, reason: string): Promise<any> {
    return await apiClient.put(`/api/admin/payout/${payoutId}/reject`, { reason });
  }

  /**
   * Hold payout
   */
  async holdPayout(payoutId: string, reason: string): Promise<any> {
    return await apiClient.put(`/api/admin/payout/${payoutId}/hold`, { reason });
  }

  /**
   * Process payout
   */
  async processPayout(payoutId: string): Promise<any> {
    return await apiClient.put(`/api/admin/payout/${payoutId}/process`);
  }
}

export const adminService = new AdminService();
