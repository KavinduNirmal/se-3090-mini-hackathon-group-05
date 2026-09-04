import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';
import { donorsRouter } from './modules/donors/presentation/donors.router.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'server' });
  });

  app.use('/api/donations', donorsRouter);

  return app;
}
