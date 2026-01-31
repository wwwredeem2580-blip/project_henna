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

export interface PaymentDetails {
  method: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer';
  mobileNumber?: string;
  accountHolderName: string;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface HostProfile {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    businessName: string;
    businessEmail: string;
    role: string;
    emailVerified: boolean;
  };
  phoneVerified: boolean;
  phoneVerificationDetails: {
    verifiedAt: string;
    phoneNumber: string;
  } | null;
  paymentDetails: PaymentDetails | null;
  profileComplete: boolean;
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
   * Get host event by ID
   */
  async getHostEventById(eventId: string): Promise<any> {
    return await apiClient.get(`/api/host/event/${eventId}`);
  }

  /**
   * Publish event
   */
  async publishEvent(eventId: string): Promise<any> {
    return await apiClient.put(`/api/host/event/${eventId}/publish`);
  }

  /**
   * Get host profile with verification status
   */
  async getProfile(): Promise<HostProfile> {
    return await apiClient.get('/api/host/profile');
  }

  /**
   * Update payment details
   */
  async updatePaymentDetails(details: Partial<PaymentDetails>): Promise<{ success: boolean; paymentDetails: PaymentDetails }> {
    return await apiClient.post('/api/host/profile/payment', details);
  }

  /**
   * Delete payment details
   */
  async deletePaymentDetails(): Promise<{ success: boolean }> {
    return await apiClient.delete('/api/host/profile/payment');
  }
}

export const hostEventsService = new HostEventsService();
export type { EventData, EventDraftResponse };
