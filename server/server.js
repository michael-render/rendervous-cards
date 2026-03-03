import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'fs/promises';
import pool, { initDB } from './db.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
const allowedOrigins = [
  'http://localhost:8080',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));

// Rate limiting
app.use('/api/cards', rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Body parsing — 5 MB limit for base64 images
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api', apiRoutes);

// Startup
let server;

async function start() {
  const storagePath = process.env.CARD_STORAGE_PATH || './card-storage';
  await fs.mkdir(storagePath, { recursive: true });

  await initDB();

  server = app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

// Graceful shutdown
function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  if (server) server.close();
  pool.end().then(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
