import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { initEmailWorker } from './workers/email.worker';

const server = createServer(app);
const PORT: number = parseInt(process.env.PORT || '3001');

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

initEmailWorker();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default server;

