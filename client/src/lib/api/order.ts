import { apiClient } from './client';

// Type Definitions
export interface OrderTicket {
  ticketVariantId: string;
  variantName: string;
  quantity: number;
  pricePerTicket: number;
}

export interface CreateOrderPayload {
  eventId: string;
  tickets: OrderTicket[];
  paymentMethod: 'bkash' | 'card' | 'free';
}

export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  expiresAt?: string;
  paymentId?: string;
  paymentUrl?: string;
  isFree?: boolean;
  paymentStatus?: string;
}

export interface PaymentCallbackResponse {
  success: boolean;
  message: string;
  orderId: string;
  ticketCount?: number;
}

export interface OrderDetails {
  _id: string;
  orderNumber: string;
  userId: string;
  eventId: {
    _id: string;
    title: string;
    schedule: {
      startDate: string;
      venue: string;
    };
    media: {
      coverImage: {
        url: string;
        alt: string;
      };
    };
  };
  tickets: Array<{
    ticketVariantId: string;
    variantName: string;
    quantity: number;
    pricePerTicket: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    platformFee: number;
    paymentFee: number;
    total: number;
    currency: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  paymentStatus: 'pending' | 'succeeded' | 'failed';
  paymentMethod: string;
  createdAt: string;
  expiresAt?: string;
  confirmedAt?: string;
  ticketIds?: string[];
}

export const orderService = {
  /**
   * Create a new order and reserve tickets
   * @param orderData - Order creation payload
   * @returns Order response with payment URL or confirmation
   */
  createOrder: async (orderData: CreateOrderPayload): Promise<OrderResponse> => {
    try {
      const response = await apiClient.post('/api/order', orderData);
      return response as OrderResponse;
    } catch (error: any) {
      console.error('Order creation failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  /**
   * Get order details by order ID
   * @param orderId - The order ID
   * @returns Order details
   */
  getOrder: async (orderId: string): Promise<OrderDetails> => {
    try {
      const response = await apiClient.get(`/api/order?orderId=${orderId}`);
      return response as OrderDetails;
    } catch (error: any) {
      console.error('Failed to fetch order:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  /**
   * Process payment callback after payment completion
   * @param orderId - The order ID
   * @param paymentId - The payment ID from payment gateway
   * @returns Payment callback response
   */
  processPaymentCallback: async (
    orderId: string,
    paymentId: string
  ): Promise<PaymentCallbackResponse> => {
    try {
      const response = await apiClient.get(
        `/api/order/bkash/callback?orderId=${orderId}&paymentId=${paymentId}`
      );
      return response as PaymentCallbackResponse;
    } catch (error: any) {
      console.error('Payment callback failed:', error);
      throw new Error(error.response?.data?.message || 'Payment processing failed');
    }
  },
};
