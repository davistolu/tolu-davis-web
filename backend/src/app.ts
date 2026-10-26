import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDatabase, getActiveDriver } from './db/db.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Dynamic CORS configuration supporting Vercel previews & production
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === CLIENT_URL ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('netlify.app') ||
      (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.split(',').includes(origin))
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.options('*', cors());

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Lazy DB initialization for serverless / lambda environments
let dbInitialized = false;
let dbInitPromise: Promise<any> | null = null;
app.use(async (_req, _res, next) => {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = initDatabase()
        .then(() => {
          dbInitialized = true;
        })
        .catch(err => {
          console.warn('[DB] Handled initialization warning:', err.message);
          dbInitialized = true; // Fallback to local/in-memory store
        });
    }
    await dbInitPromise;
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Healthcheck endpoints
app.get('/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Toluwanimi Davis Portfolio Backend',
    driver: getActiveDriver(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Toluwanimi Davis Portfolio Backend',
    driver: getActiveDriver(),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend dist if available (Production deployment)
const frontendDistPath = path.resolve(process.cwd(), '..', 'frontend', 'dist');
const legacyDistPath = path.resolve(process.cwd(), '..', 'dist');
const distPath = fs.existsSync(frontendDistPath) ? frontendDistPath : legacyDistPath;

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;
