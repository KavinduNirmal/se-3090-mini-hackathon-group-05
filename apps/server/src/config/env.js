const REQUIRED = ['DATABASE_URL', 'DIRECT_URL'];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[config] Missing required environment variables: ${missing.join(', ')}. See .env.example.`,
  );
  process.exit(1);
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
