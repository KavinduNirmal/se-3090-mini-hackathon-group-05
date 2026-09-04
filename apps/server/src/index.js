import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { createApp } from './app.js';

async function main() {
  const app = createApp();

  try {
    await prisma.$connect();
    console.log('[db] connected to NeonDB');
  } catch (err) {
    console.error('[db] failed to connect to NeonDB');
    console.error(err);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async () => {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
