import express from 'express';
import router from './router';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();


mongoose.connect(process.env.MONGO_URI!);

app.use(express.json())

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
