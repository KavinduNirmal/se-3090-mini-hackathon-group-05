import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';
import authRouter from './modules/auth/presentation/authRouter.js';
import rescueRouter from './modules/rescue/presentation/rescueRouter.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { donorsRouter } from './modules/donors/presentation/donors.router.js';

// Express application bootstrap. Mounts only global middleware, health probe,
// and feature routers.
export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'server' });
  });

  // Mount Feature Presentation Routers
  app.use('/api/auth', authRouter);
  app.use('/api/donations', rescueRouter);
  app.use('/api/donations', donorsRouter);

  // Global Error Handler (must be after routers)
  app.use(errorHandler);

  return app;
}

