import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';
import authRouter from './modules/auth/presentation/authRouter.js';
import rescueRouter from './modules/rescue/presentation/rescueRouter.js';
import adminRouter from './modules/admin/presentation/adminRouter.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { requireAdminApi } from './shared/middleware/requireAdminApi.js';
import { donorsRouter } from './modules/donors/presentation/donors.router.js';

// Comma-separated allowlist from CORS_ORIGIN (e.g.
// "https://share-a-plate.kavindunirmal.com,https://*.vercel.app").
// Defaults to '*' which keeps the historic permissive behaviour for local dev.
const allowedOrigins = (env.corsOrigin ?? '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return allowedOrigins.some((allowed) => {
      const allowedHost = new URL(allowed).hostname;
      return allowedHost.startsWith('*.') && hostname.endsWith(allowedHost.slice(1));
    });
  } catch {
    return false;
  }
}

// Express application bootstrap. Mounts only global middleware, health probe,
// and feature routers.
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        // Requests without an Origin header (curl, same-origin, probes) are
        // never cross-origin and can always pass.
        if (!origin || isOriginAllowed(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'server' });
  });

  // Mount Feature Presentation Routers
  app.use('/api/auth', authRouter);
  // Admin REST API (Clerk JWT + publicMetadata.role === 'admin' guard).
  app.use('/api/admin', requireAdminApi(), adminRouter);
  // Donor listing router first: its GET /metrics & PATCH /:id/status routes would
  // otherwise be shadowed by the rescue router's catch-all GET /:id.
  app.use('/api/donations', donorsRouter);
  app.use('/api/donations', rescueRouter);

  // Global Error Handler (must be after routers)
  app.use(errorHandler);

  return app;
}

