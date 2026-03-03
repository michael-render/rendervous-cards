import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { initDB } from './db.js';
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

// Body parsing — 50 MB limit for base64 images
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', apiRoutes);

// Startup
async function start() {
  // Ensure card storage directory exists
  const storagePath = process.env.CARD_STORAGE_PATH || './card-storage';
  await fs.mkdir(storagePath, { recursive: true });

  await initDB();

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
