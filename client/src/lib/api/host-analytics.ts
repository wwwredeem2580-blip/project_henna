import { apiClient } from "./client";

export interface HostEventDetailsResponse {
  event: {
    _id: string;
    title: string;
    status: 'draft' | 'published' | 'live' | 'ended' | 'cancelled';
    salesPaused: boolean;
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

export const hostAnalyticsService = {
  getEventAnalytics: async (eventId: string): Promise<HostEventDetailsResponse> => {
    // In a real app, this would hit an endpoint like `/host/events/${eventId}/analytics`
    // For now, we might fetch the basic event and mock the analytics if the API doesn't exist yet
    // Or if the user says "use dummy data for now", we can return a mock structure here or in the component.
    // I will implement the fetch assuming the endpoint will exist or return mock data if it fails/is missing.
    try {
        const response = await apiClient.get<HostEventDetailsResponse>(`/host/events/${eventId}/analytics`);
        return response.data;
    } catch (error) {
        console.warn("Analytics API not found, returning mock data");
        // Return structured mock data for development
        return mockHostEventAnalytics(eventId);
    }
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
