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
app.use(helmet(), compression(), morgan('dev'), express.json({ limit: '1mb' }), cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }), routes);
app.use((err, _q, res, _n) => { console.error(err); res.status(500).json({ message: 'Something went wrong' }); });

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('API running')))
  .catch((e) => { console.error(e); process.exit(1); });
