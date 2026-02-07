import express from 'express';
import router from './router';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import compression from 'compression';
dotenv.config();

const app = express();

// MongoDB with optimized connection pooling for production
mongoose.connect(process.env.MONGO_URI!, {
  maxPoolSize: 200,      // Handle 200 concurrent connections
  minPoolSize: 20,       // Keep 20 connections warm
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 30000,
});

// Trust proxy for production (rate limiting, IP detection)
app.set('trust proxy', 1);

// Compression middleware (before routes)
app.use(compression({
  filter: (req: any, res: any) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Balance between speed and compression
}));

// Request size limits (prevent payload attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000', 
    'https://scanner.zenvy.com.bd',
    'https://www.zenvy.com.bd'
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(helmet());
app.use(cookieParser());
app.use(router);

app.get("/", (req, res) => {
  res.json({ message: "Server is Running!" });
});

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Malformed JSON' })
  }
  next(err)
})

export default app;
