import { Order } from "../../database/order/order";
import { Event } from "../../database/event/event";

export async function updateEventMetrics(orderId: string) {
  const order = await Order.findById(orderId).populate('eventId');
  
  const ticketsSold = order.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0);
  
  await Event.updateOne(
    { _id: order.eventId },
    {
      $inc: {
        'metrics.revenue': order.pricing.total,
        'metrics.ticketsSold': ticketsSold,
        'metrics.orders': 1
      },
      $set: {
        'metrics.updatedAt': new Date()
      }
    }
  );
}