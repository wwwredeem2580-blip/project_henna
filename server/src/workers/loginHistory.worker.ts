import { Worker } from 'bullmq';
import { User } from '../database/auth/auth';
import { addEmailJob } from './email.queue';

// Redis Configuration
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

interface LoginHistoryJobData {
  userId: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

// Worker to process login history updates
export const loginHistoryWorker = new Worker(
  'login-history-queue',
  async (job) => {
    const { userId, ip, userAgent, timestamp } = job.data as LoginHistoryJobData;

    try {
      console.log(`[LOGIN HISTORY] Processing for user: ${userId}`);

      // Fetch user
      const user = await User.findById(userId);
      if (!user) {
        console.error(`[LOGIN HISTORY] User not found: ${userId}`);
        return;
      }

      // Check if this is a new IP (for suspicious login detection)
      const isKnownIp = user.loginHistory?.some((entry: any) => entry.ip === ip) || false;

      if (!isKnownIp && user.loginHistory && user.loginHistory.length > 0) {
        console.warn(`[SECURITY] New IP login detected for ${user.email}: ${ip}`);

        // Queue suspicious login email
        await addEmailJob('SUSPICIOUS_LOGIN', {
          name: user.firstName,
          email: user.email,
          time: new Date(timestamp).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
          ip: ip,
          device: userAgent,
        });
      }

      // Update login history
      if (!user.loginHistory) {
        user.loginHistory = [];
      }

      user.loginHistory.push({
        ip,
        userAgent,
        timestamp: new Date(timestamp),
      });

      // Keep history manageable (last 20 entries)
      if (user.loginHistory.length > 20) {
        user.loginHistory = user.loginHistory.slice(-20);
      }

      // Update last login metadata
      user.lastLoginAt = new Date(timestamp);
      user.lastLoginIP = ip;

      await user.save();
      console.log(`[LOGIN HISTORY] Updated for user: ${user.email}`);
    } catch (error) {
      console.error('[LOGIN HISTORY] Error processing job:', error);
      throw error; // Retry on failure
    }
  },
  {
    connection: redisOptions,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

loginHistoryWorker.on('completed', (job) => {
  console.log(`[LOGIN HISTORY] Job ${job.id} completed`);
});

loginHistoryWorker.on('failed', (job, err) => {
  console.error(`[LOGIN HISTORY] Job ${job?.id} failed:`, err);
});

console.log('🔄 Login History Worker started');
