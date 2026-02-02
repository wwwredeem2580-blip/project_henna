import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { initEmailWorker } from './workers/email.worker';
import { initChatbotSocket } from './websocket/chatbot';
import cleanupExpiredOrders from './workers/orders.cleanup';
import { generatePendingPayouts } from './workers/payout.worker';

const server = createServer(app);
const PORT: number = parseInt(process.env.PORT || '3001');

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

export default server;

