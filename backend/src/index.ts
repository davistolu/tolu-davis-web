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
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Root healthcheck
app.get('/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Toluwanimi Davis Portfolio Backend',
    driver: getActiveDriver(),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend dist if available (Production deployment)
const distPath = path.resolve(process.cwd(), '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 [ToluOS Backend] Server running on port ${PORT}`);
    console.log(`🔗 REST API: http://localhost:${PORT}/api/`);
    console.log(`📡 Database Driver: ${getActiveDriver()}`);
    console.log(`💻 Ready to receive frontend requests!\n`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL ERROR] Server failed to start:', err);
  process.exit(1);
});
