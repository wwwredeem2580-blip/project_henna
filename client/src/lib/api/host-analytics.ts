import { apiClient } from "./client";

export interface HostEventDetailsResponse {
  event: {
    _id: string;
    title: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'live' | 'ended' | 'cancelled';
    salesPaused: boolean; // Deprecated - use moderation.sales.paused
    moderation?: {
      sales?: {
        paused: boolean;
        pausedAt?: Date;
        pausedBy?: string;
        pausedReason?: string;
      };
    };
    venue?: {
      name: string;
      capacity: number;
      address?: {
        city: string;
        country: string;
      };
    };
    schedule?: {
      startDate: string;
      endDate: string;
      doors?: string;
      scheduleModified?: boolean; // Track if schedule has been modified (for one-time-only rule)
    };
    media?: {
      coverImage?: {
        url: string;
        alt?: string;
      };
      gallery?: Array<{
        url: string;
        caption?: string;
      }>;
    };
    category: string;
    tagline?: string;
    description?: string;
    organizer?: {
      companyName: string;
      companyEmail: string;
    };
    tickets: Array<{
      _id: string;
      name: string;
      tier: string;
      price: {
        amount: number;
        currency: string;
      };
      quantity: number;
      sold: number;
      wristbandColor?: string;
      benefits?: string[];
      isVisible: boolean;
      isActive: boolean;
    }>;
    metrics?: {
      views: number;
      orders: number;
      revenue: number;
      ticketsSold: number;
      checkIns: number;
    };
  };
  analytics: {
    totalTicketsSold: number;
    capacity: number;
    totalRevenue: number;
    totalOrders: number;
    lastOrderDate?: string;
    ticketsSoldPercentage: number;
    views: number;
    conversionRate: number;
    salesTrend: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    ticketBreakdown: Array<{
      variantName: string;
      revenue: number;
      sold: number;
    }>;
    checkInStats: {
      checkedIn: number;
      total: number;
    };
  };
}

export interface DashboardMetrics {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalTicketsSold: number;
    upcomingEvents: number;
    currency: string;
    totalPayout: number;
  };
  revenueByPeriod: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  recentActivity: {
    ordersToday: number;
    ordersThisWeek: number;
    revenueToday: number;
  };
}

export interface HostOrder {
  orderNumber: string;
  eventTitle: string;
  buyerEmail: string;
  ticketCount: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface HostOrdersResponse {
  orders: HostOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const hostAnalyticsService = {
  getEventAnalytics: async (eventId: string): Promise<HostEventDetailsResponse> => {
    try {
        return await apiClient.get<HostEventDetailsResponse>(`/api/host/event/${eventId}`);
    } catch (error) {
        console.warn("Analytics API error, returning mock data:", error);
        // Return structured mock data for development
        return mockHostEventAnalytics(eventId);
    }
  },

  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    return await apiClient.get<DashboardMetrics>('/api/host/analytics/metrics');
  },

  getHostOrders: async (
    page: number = 1, 
    limit: number = 10,
    filters?: { eventId?: string; status?: string; search?: string }
  ): Promise<HostOrdersResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.eventId) params.append('eventId', filters.eventId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    return await apiClient.get<HostOrdersResponse>(`/api/host/analytics/orders?${params.toString()}`);
  },

  getAnalyticsMetrics: async (): Promise<any> => {
    return await apiClient.get('/api/host/analytics/metrics');
  },

  getAnalyticsRevenueChart: async (period: string): Promise<any> => {
    return await apiClient.get(`/api/host/analytics/revenue-chart?period=${period}`);
  }
};

// Mock data generator for development
const mockHostEventAnalytics = (eventId: string): HostEventDetailsResponse => ({
    event: {
        _id: eventId,
        title: "Sample Event",
        status: "live",
        salesPaused: false,
        venue: {
            name: "Grand Arena",
            capacity: 500,
            address: { city: "Dhaka", country: "Bangladesh" }
        },
        schedule: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
            doors: "18:00"
        },
        category: "music",
        tickets: [
            { _id: "t1", name: "General Admission", tier: "General", price: { amount: 500, currency: "BDT" }, quantity: 300, sold: 150, isVisible: true, isActive: true },
            { _id: "t2", name: "VIP", tier: "VIP", price: { amount: 1200, currency: "BDT" }, quantity: 100, sold: 80, isVisible: true, isActive: true }
        ]
    },
    analytics: {
        totalTicketsSold: 230,
        capacity: 500,
        totalRevenue: 500 * 150 + 1200 * 80,
        totalOrders: 180,
        lastOrderDate: new Date(Date.now() - 3600000).toISOString(),
        ticketsSoldPercentage: 46,
        views: 1200,
        conversionRate: 15,
        salesTrend: [
            { date: new Date(Date.now() - 86400000 * 2).toISOString(), revenue: 50000, orders: 40 },
            { date: new Date(Date.now() - 86400000).toISOString(), revenue: 75000, orders: 60 },
            { date: new Date().toISOString(), revenue: 46000, orders: 35 }
        ],
        ticketBreakdown: [
            { variantName: "General Admission", revenue: 500 * 150, sold: 150 },
            { variantName: "VIP", revenue: 1200 * 80, sold: 80 }
        ],
        checkInStats: {
            checkedIn: 120,
            total: 230
        }
    }
});
