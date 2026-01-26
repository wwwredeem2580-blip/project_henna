import mongoose from "mongoose";

export default (events: any, analyticsMap: Map<string, any>) => {
  const formattedEvents = events.map((event: any) => {
    const analytics = analyticsMap.get((event._id as mongoose.Types.ObjectId).toString()) || {
      totalRevenue: 0,
      totalTicketsSold: 0,
      totalOrders: 0,
      conversionRate: 0,
      ticketsSoldPercentage: 0
    };
    
    // Determine display status
    
    return {
      eventId: event._id,
      title: event.title,
      status: event.status,
      startDate: event.schedule?.startDate,
      endDate: event.schedule?.endDate,
      venueName: event.venue?.name,
      coverImage: event.media?.coverImage?.url,
      totalTickets: analytics.capacity,
      ticketsSold: analytics.totalTicketsSold,
      ticketsSoldPercentage: analytics.ticketsSoldPercentage,
      revenue: analytics.totalRevenue,
      orders: analytics.totalOrders,
      conversionRate: analytics.conversionRate,
      avgOrderValue: analytics.avgOrderValue,
      updatedAt: event.updatedAt,
    };
  });
    return formattedEvents;
}
  