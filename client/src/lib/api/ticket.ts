import { apiClient } from './client';

// Type Definitions
export interface TicketTheme {
  wristbandColor?: string;
  accentColor?: string;
  isDark?: boolean;
  glassMode?: boolean;
  cornerRadius?: string;
  perforationStyle?: string;
  benefits?: string[];
  tier?: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  qrCode: string;
  qrCodeUrl: string;
  status: 'valid' | 'used' | 'cancelled' | 'expired';
  price: number;
  orderId: string;
  eventId: string;
  ticketVariantId: string;
  eventTitle: string;
  eventDate: string;
  validUntil: string;
  eventVenue: string;
  venueAddress: string;
  ticketType: string;
  checkInStatus: 'not_checked_in' | 'checked_in';
  issuedAt: string;
  ticketTheme?: TicketTheme;
}

export const ticketService = {
  /**
   * Get all tickets for the authenticated user
   * @returns Array of user tickets grouped by events
   */
  getUserTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await apiClient.get('/api/ticket');
      return response as Ticket[];
    } catch (error: any) {
      console.error('Failed to fetch tickets:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
    }
  },

  /**
   * Verify a ticket using QR code data
   * @param qrData - The QR code data to verify
   * @param eventId - The event ID to verify against
   * @returns Verification result
   */
  verifyTicket: async (qrData: string, eventId: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/api/ticket/verify/${eventId}`, { qrData });
      return response;
    } catch (error: any) {
      console.error('Ticket verification failed:', error);
      throw new Error(error.response?.data?.message || 'Ticket verification failed');
    }
  },
};
