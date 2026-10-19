import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes.js';

const app = express();
app.set('trust proxy', 1);

// Allowed frontend origins (hardcoded + optional extras from CLIENT_URL)
const allowedOrigins = [
  'http://localhost:5173',
  'https://catvora.vercel.app',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
];

console.log('Allowed origins:', allowedOrigins);

// CORS first, so every response (even errors) carries the headers
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }),
  compression(),
  morgan('dev'),
  express.json({ limit: '1mb' }),
  cookieParser()
);

// Open https://catvora.onrender.com/health to confirm this version is live
app.get('/health', (_req, res) => {
  res.json({ ok: true, version: 'cors-fix-v3', allowedOrigins });
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 });

// Routes work both with and without the /api prefix
app.use('/api', limiter, routes);
app.use('/', limiter, routes);

app.use((err, _q, res, _n) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(process.env.PORT || 5000, () => console.log('API running'))
  )
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });