import { Queue } from 'bullmq';

// Redis Configuration - use ConnectionOptions from bullmq
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

export const loginHistoryQueue = new Queue('login-history-queue', {
  connection: redisOptions,
});

export interface LoginHistoryData {
  userId: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

export const addLoginHistoryJob = async (data: LoginHistoryData) => {
  return loginHistoryQueue.add('update-history', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  });
};
