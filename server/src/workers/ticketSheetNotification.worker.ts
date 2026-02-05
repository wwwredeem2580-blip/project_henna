import { Worker } from 'bullmq';
import { Event } from '../database/event/event';
import { addEmailJob } from './email.queue';
import { redis } from '../lib/redis';

/**
 * Ticket Sheet Notification Worker
 * Sends email reminders to hosts 24h and 3h before event starts
 * with link to download ticket sheet PDF
 */

const ticketSheetNotificationWorker = new Worker(
  'ticket-sheet-notifications',
  async (job) => {
    const { type } = job.data;

    if (type === 'check-upcoming-events') {
      await checkAndSendNotifications();
    }
  },
  {
    connection: redis,
    concurrency: 1
  }
);

/**
 * Check for events starting in 24h or 3h and send notifications
 */
async function checkAndSendNotifications() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  // Find events starting in ~24 hours (23.5h to 24.5h window)
  const events24h = await Event.find({
    'schedule.startDate': {
      $gte: new Date(in24Hours.getTime() - 30 * 60 * 1000), // 23.5h
      $lte: new Date(in24Hours.getTime() + 30 * 60 * 1000)  // 24.5h
    },
    status: { $in: ['published', 'live'] },
    'notifications.ticketSheet24hSent': { $ne: true }
  }).populate('hostId', 'email firstName lastName');

  // Find events starting in ~3 hours (2.5h to 3.5h window)
  const events3h = await Event.find({
    'schedule.startDate': {
      $gte: new Date(in3Hours.getTime() - 30 * 60 * 1000), // 2.5h
      $lte: new Date(in3Hours.getTime() + 30 * 60 * 1000)  // 3.5h
    },
    status: { $in: ['published', 'live'] },
    'notifications.ticketSheet3hSent': { $ne: true }
  }).populate('hostId', 'email firstName lastName');

  // Send 24h notifications
  for (const event of events24h) {
    try {
      await sendTicketSheetNotification(event, '24h');
      
      // Mark as sent
      await Event.updateOne(
        { _id: event._id },
        { $set: { 'notifications.ticketSheet24hSent': true } }
      );
      
      console.log(`[TICKET_SHEET_NOTIFICATION] Sent 24h reminder for event ${event._id}`);
    } catch (error) {
      console.error(`[TICKET_SHEET_NOTIFICATION] Failed to send 24h reminder for event ${event._id}:`, error);
    }
  }

  // Send 3h notifications
  for (const event of events3h) {
    try {
      await sendTicketSheetNotification(event, '3h');
      
      // Mark as sent
      await Event.updateOne(
        { _id: event._id },
        { $set: { 'notifications.ticketSheet3hSent': true } }
      );
      
      console.log(`[TICKET_SHEET_NOTIFICATION] Sent 3h reminder for event ${event._id}`);
    } catch (error) {
      console.error(`[TICKET_SHEET_NOTIFICATION] Failed to send 3h reminder for event ${event._id}:`, error);
    }
  }
}

/**
 * Send ticket sheet notification email
 */
async function sendTicketSheetNotification(event: any, timing: '24h' | '3h') {
  const host = event.hostId;
  const downloadUrl = `${process.env.CLIENT_URL}/host/events/manage/${event._id}?tab=scanner`;
  
  const totalTickets = event.tickets?.reduce((sum: number, t: any) => sum + (t.sold || 0), 0) || 0;

  await addEmailJob('TICKET_SHEET_REMINDER', {
    hostName: `${host.firstName} ${host.lastName}`,
    hostEmail: host.email,
    eventTitle: event.title,
    eventDate: new Date(event.schedule.startDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    eventTime: new Date(event.schedule.startDate).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    venue: event.venue?.name || 'TBA',
    totalTickets,
    downloadUrl,
    timing, // '24h' or '3h'
    hoursUntilEvent: timing === '24h' ? 24 : 3
  });
}

ticketSheetNotificationWorker.on('completed', (job) => {
  console.log(`[TICKET_SHEET_WORKER] Job ${job.id} completed`);
});

ticketSheetNotificationWorker.on('failed', (job, err) => {
  console.error(`[TICKET_SHEET_WORKER] Job ${job?.id} failed:`, err);
});

export default ticketSheetNotificationWorker;
