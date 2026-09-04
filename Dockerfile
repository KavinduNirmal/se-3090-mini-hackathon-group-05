# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Share a Plate — backend container (Express + Prisma + NeonDB)
#
# Build context MUST be the repository root (pnpm workspace monorepo):
#   docker build -f Dockerfile -t share-a-plate/server .
#
# The image contains only the `server` workspace package. Postgres schema
# migrations are applied at container start (idempotent `prisma migrate
# deploy`) before the API boots, so Azure just needs DATABASE_URL/DIRECT_URL
# injected as app settings.
# ---------------------------------------------------------------------------

FROM node:22-alpine

# Activate pnpm from the repo's packageManager field (pnpm@11.x).
RUN corepack enable

WORKDIR /app

# Copy workspace manifests first to leverage the Docker layer cache.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Everything else (server source + prisma schema/migrations are the bits we
# run; the full workspace is copied so pnpm can resolve the lockfile).
COPY apps ./apps

# `prisma generate` resolves env("DATABASE_URL") at build time but never
# connects — a placeholder keeps the build env-var-free.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    DIRECT_URL="postgresql://build:build@localhost:5432/build"

# Install only the `server` workspace package (keeps the image lean) and
# generate the Prisma client (driver adapter / engineType = client).
RUN pnpm install --frozen-lockfile --filter server

WORKDIR /app/apps/server
RUN pnpm exec prisma generate

ENV NODE_ENV=production

# 4000 is the app default; Azure App Service overrides it via PORT.
EXPOSE 4000

# Apply pending migrations, then start the Express API.
CMD ["sh", "/app/apps/server/docker-entrypoint.sh"]
