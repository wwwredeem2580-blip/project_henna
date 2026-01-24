import { Queue } from 'bullmq';

// Redis Configuration - use ConnectionOptions from bullmq
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

export const emailQueue = new Queue('email-queue', {
  connection: redisOptions,
});

export const addEmailJob = async (type: string, data: any) => {
  return emailQueue.add(type, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  });
};
