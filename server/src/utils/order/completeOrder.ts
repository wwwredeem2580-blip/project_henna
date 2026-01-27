import { Event } from "../../database/event/event";
import { createTicket } from "./ticket";
import { updateEventMetrics } from "./updateEventMetrics";
import { addEmailJob } from "../../workers/email.queue";

export async function completeOrder(order: any) {
    // 1. Update Order
    if (order.status !== "confirmed") {
        order.status = "confirmed";
        order.paymentStatus = "succeeded";
        order.confirmedAt = new Date();
        order.paidAt = new Date();
        await order.save();
    }

    // 2. Update Inventory (Reserved -> Sold)
    for (const item of order.tickets) {
        // ... (reuse logic from callback)
        // Optimization: We can just use updateOne here
        const event = await Event.findOne(
            { _id: order.eventId, "tickets._id": item.ticketVariantId },
            { "tickets.$": 1 }
        );
        const currentReserved = event?.tickets[0]?.reserved || 0;
        const newReserved = Math.max(0, currentReserved - item.quantity);

        await Event.updateOne(
            { _id: order.eventId, "tickets._id": item.ticketVariantId },
            {
                $set: { "tickets.$.reserved": newReserved },
                $inc: { "tickets.$.sold": item.quantity }
            }
        );
    }
    
    // 3. Generate Tickets
    const ticketIds: any[] = [];
    try {
        for (const item of order.tickets) {
            for (let i = 0; i < item.quantity; i++) {
                const ticket = await createTicket(order, item, i);
                ticketIds.push(ticket._id);
            }
        }
    } catch (err) {
        console.error('[CRITICAL] Ticket generation failed:', err);
        order.requiresManualReview = true;
        order.manualReviewReason = 'ticket_generation_failed';
        await order.save();
    }
    
    // 4. Link Tickets
    if (ticketIds.length > 0) {
        order.ticketIds = ticketIds;
        await order.save();
    }
    
    // 5. Update Metrics
    await updateEventMetrics(order._id.toString());
    
    // 6. Send Email
    // We'll call the send email logic here (extracted from callback)
    await sendOrderConfirmationEmail(order, ticketIds);
    
    return ticketIds;
}

async function sendOrderConfirmationEmail(order: any, ticketIds: any[]) {
     try {

        const event = await Event.findById(order.eventId);
        if (event && event.schedule) {
            await addEmailJob('email-notification', {
                type: 'ORDER_CONFIRMATION',
                payload: {
                    buyerEmail: order.buyerEmail,
                    buyerName: order.buyerEmail.split('@')[0],
                    orderNumber: order.orderNumber,
                    eventTitle: event.title,
                    eventDate: new Date(event.schedule.startDate).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    }),
                    ticketCount: ticketIds.length,
                    totalAmount: order.pricing?.subtotal,
                },
            });
        }
    } catch (emailError) {
        console.error('[EMAIL_ERROR] Failed to queue order confirmation:', emailError);
    }
}