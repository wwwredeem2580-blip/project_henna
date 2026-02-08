import cluster from 'cluster';
import os from 'os';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createApp } from './app';
import mongoose from 'mongoose';
import { initEmailWorker } from './workers/email.worker';
import './workers/loginHistory.worker';
import './workers/ticketGeneration.worker';
import { initChatbotSocket } from './websocket/chatbot';
import cleanupExpiredOrders from './workers/orders.cleanup';
import { generatePendingPayouts } from './workers/payout.worker';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`🚀 Master process ${process.pid} is running`);
  console.log(`🔧 Spawning ${numCPUs} worker processes...`);

  // Fork workers (one per CPU core)
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Track worker restarts
  let restartCount = 0;
  const MAX_RESTARTS = 10;
  const RESTART_WINDOW = 60000; // 1 minute

  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️  Worker ${worker.process.pid} died (${signal || code})`);
    
    restartCount++;
    
    // Reset restart count after window
    setTimeout(() => {
      restartCount = Math.max(0, restartCount - 1);
    }, RESTART_WINDOW);

    // Prevent restart storm
    if (restartCount > MAX_RESTARTS) {
      console.error('❌ Too many worker restarts. Shutting down...');
      process.exit(1);
    }

    // Spawn new worker
    console.log('🔄 Starting new worker...');
    cluster.fork();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received. Shutting down gracefully...');
    
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill();
    }
    
    setTimeout(() => {
      console.log('⏱️  Forcing shutdown after timeout');
      process.exit(0);
    }, 10000);
  });

} else {
  // Worker process
  const app = createApp();
  const PORT = parseInt(process.env.PORT || '3001');
  const server = createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Initialize WebSockets
  initChatbotSocket(io);

  // Initialize workers (only on first worker to avoid duplicates)
  if (cluster.worker?.id === 1) {
    initEmailWorker();
    
    // Cron jobs
    setInterval(async () => {
      try {
        await cleanupExpiredOrders();
      } catch (error) {
        console.error('[CRON] Order cleanup job failed:', error);
      }
    }, 5 * 60 * 1000);
    
    setInterval(async () => {
      try {
        await generatePendingPayouts();
      } catch (error) {
        console.error('[CRON] Payout generation job failed:', error);
      }
    }, 24 * 60 * 60 * 1000);
    
    console.log('🗑️ Cron jobs initialized on worker 1');
  }

  server.listen(PORT, () => {
    console.log(`✅ Worker ${process.pid} started on port ${PORT}`);
  });

  // Graceful shutdown for worker
  const gracefulShutdown = async (signal: string) => {
    console.log(`📴 Worker ${process.pid} received ${signal}. Closing server...`);
    
    server.close(() => {
      console.log(`✅ Worker ${process.pid} closed HTTP server`);
    });

    // Close MongoDB
    try {
      await mongoose.connection.close();
      console.log(`✅ Worker ${process.pid} closed MongoDB`);
    } catch (err) {
      console.error(`❌ Worker ${process.pid} MongoDB close error:`, err);
    }

    // Close Redis queues
    try {
      const { emailQueue } = await import('./workers/email.queue');
      const { loginHistoryQueue } = await import('./workers/loginHistory.queue');
      await emailQueue.close();
      await loginHistoryQueue.close();
      console.log(`✅ Worker ${process.pid} closed Redis queues`);
    } catch (err) {
      console.error(`❌ Worker ${process.pid} Redis close error:`, err);
    }

    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

