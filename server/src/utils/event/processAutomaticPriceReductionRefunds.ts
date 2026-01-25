import { Order } from "../../database/order/order";
import { User } from "../../database/auth/auth";
import { addEmailJob } from "../../workers/email.queue";

export async function processAutomaticPriceReductionRefunds(event: any, refundsRequired: any[], hostId: string) {
  for (const refundInfo of refundsRequired) {
    try {
      const { ticketId, oldPrice, newPrice, ticketName } = refundInfo;
      console.log(ticketId, oldPrice, newPrice, ticketName);
      const priceDifference = oldPrice - newPrice;
      let totalRefunded = 0;

      // Find all orders with this ticket type at the higher price
      const affectedOrders = await Order.find({
        eventId: event._id,
        'tickets.ticketVariantId': ticketId,
        status: 'confirmed'
      }).populate('userId');

      for (const order of affectedOrders) {
        // Calculate refund amount for this order
        const affectedTickets = order.tickets.filter(
          (t: any) => t.ticketVariantId.toString() === ticketId
        );

        const refundAmount = affectedTickets.reduce(
          (sum: number, t: any) => sum + (t.quantity * priceDifference),
          0
        );
        if (refundAmount <= 0) continue;

        try {
          // Process partial refund via bKash
          const refundResult = await processBkashRefund({
            paymentId: order.paymentIntentId,
            amount: refundAmount,
          });

          // Update order with partial refund
          if (!order.refund) {
            order.refund = {
              amount: refundAmount,
              reason: 'price_reduction',
              refundedBy: hostId,
              refundedAt: new Date(),
              refundType: 'partial',
              transactionId: refundResult.transactionId
            };
          } else {
            order.refund.amount += refundAmount;
          }

          await order.save();
          totalRefunded += refundAmount;

          // Send notification email to buyer
          const userData = await User.findById(order.userId);
          await addEmailJob('email-notification', {
            type: 'PRICE_REDUCTION_REFUND',
            payload: {
              order,
              user: {
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email
              },
              event,
              refundAmount,
              oldPrice,
              newPrice,
              ticketType: 'bought'
            }
          });

        } catch (error: any) {
          console.error(`[PRICE_REFUND_ERROR] Order ${order.orderNumber}:`, error);
        }
      }

      // Send summary email to host
      const hostData = await User.findById(hostId);
      await addEmailJob('email-notification', {
        type: 'PRICE_REDUCTION_REFUND_SUMMARY',
        payload: {
          host: {
            name: `${hostData.firstName} ${hostData.lastName}`,
            email: hostData.email
          },
          event,
          ticketName,
          oldPrice,
          newPrice,
          totalRefunded,
          affectedOrders: affectedOrders.length
        }
      });
    } catch (error: any) {
      console.error('[PRICE_REDUCTION_REFUND_ERROR]', error);
    }
  }
}

// Helper function for bKash refund (placeholder - implement based on your bKash integration)
async function processBkashRefund(data: { paymentId: string; amount: number }) {

  return {
    transactionId: `TXN${Date.now()}`,
    status: 'success'
  };

}