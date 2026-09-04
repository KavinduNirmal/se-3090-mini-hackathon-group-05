import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';

// Express application bootstrap. Mounts only global middleware and a health
// probe. Feature routers (module presentation layers) mount here as they are
// implemented.
export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'server' });
  });

  return app;
}
