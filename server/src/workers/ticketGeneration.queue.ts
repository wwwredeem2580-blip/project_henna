import { Queue } from 'bullmq';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

export const ticketGenerationQueue = new Queue('ticket-generation-queue', {
  connection: redisOptions,
});

export interface TicketGenerationJob {
  orderId: string;
  orderNumber: string;
  tickets: Array<{
    ticketVariantId: string;
    variantName: string;
    quantity: number;
    pricePerTicket: number;
  }>;
}

export const addTicketGenerationJob = async (data: TicketGenerationJob) => {
  return ticketGenerationQueue.add('generate-tickets', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500,     // Keep last 500 failed jobs for debugging
  });
};
