import { Order } from "../../database/order/order";
import { Payment } from "../../database/payment/payment";
import { Event } from "../../database/event/event";

export async function handlePaymentFailure(order: any, payment: any, result: any) {
  // 1. Cancel order
  await Order.updateOne(
    { _id: order._id },
    {
      status: "cancelled",
      paymentStatus: "failed",
      cancelledAt: new Date()
    }
  );

  // 2. Release inventory
  for (const item of order.tickets) {
    const event = await Event.findOne(
      { _id: order.eventId, "tickets._id": item.ticketVariantId },
      { "tickets.$": 1 }
    );

    const currentReserved = event?.tickets[0]?.reserved || 0;
    const newReserved = Math.max(0, currentReserved - item.quantity);

    await Event.updateOne(
      { _id: order.eventId, "tickets._id": item.ticketVariantId },
      { $set: { "tickets.$.reserved": newReserved } }
    );
  }

  // 3. Log failure
  await Payment.updateOne(
    { _id: payment._id },
    {
      status: "failed",
      failedAt: new Date(),
      failureCode: result?.statusCode,
      failureMessage: result?.statusMessage || 'Payment execution failed'
    }
  );

  console.log(`[PAYMENT_FAILED] Order: ${order._id}, Code: ${result?.statusCode}`);
}
