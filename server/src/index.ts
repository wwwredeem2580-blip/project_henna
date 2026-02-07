import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import mongoose from 'mongoose';
import { initEmailWorker } from './workers/email.worker';
import './workers/loginHistory.worker'; // Initialize login history worker
import './workers/ticketGeneration.worker'; // Initialize ticket generation worker
import { initChatbotSocket } from './websocket/chatbot';
import cleanupExpiredOrders from './workers/orders.cleanup';
import { generatePendingPayouts } from './workers/payout.worker';

const server = createServer(app);
const PORT: number = parseInt(process.env.PORT || '3001');

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.json(health);
});

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize WebSockets
initChatbotSocket(io);

initEmailWorker();

setInterval(async () => {
  try {
    await cleanupExpiredOrders();
  } catch (error) {
    console.error('[CRON] Order cleanup job failed:', error);
  }
}, 5 * 60 * 1000);

console.log('🗑️ Order cleanup cron job scheduled (runs every 5 minutes)');

setInterval(async () => {
  try {
    await generatePendingPayouts();
  } catch (error) {
    console.error('[CRON] Payout generation job failed:', error);
  }
}, 24 * 60 * 60 * 1000);

console.log('💰 Payout generation cron job scheduled (runs every 24 hours)');

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} received, closing gracefully...`);
  
  // Stop accepting new connections
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
  
  // Close MongoDB connection
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (err) {
    console.error('❌ Error closing MongoDB:', err);
  }
  
  // Close Redis connections
  try {
    const { emailQueue } = await import('./workers/email.queue');
    const { loginHistoryQueue } = await import('./workers/loginHistory.queue');
    await emailQueue.close();
    await loginHistoryQueue.close();
    console.log('✅ Redis queues closed');
  } catch (err) {
    console.error('❌ Error closing Redis:', err);
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

export default server;

