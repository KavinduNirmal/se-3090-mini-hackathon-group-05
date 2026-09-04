import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { env } from './env.js';

// Singleton Prisma client bound to NeonDB (pooled connection) via the
// node-postgres driver adapter (engineType = "client").
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.databaseUrl }),
});
