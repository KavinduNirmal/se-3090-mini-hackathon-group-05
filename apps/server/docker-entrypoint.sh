#!/bin/sh
set -e

echo "[entrypoint] Applying pending Prisma migrations..."
pnpm exec prisma migrate deploy

echo "[entrypoint] Starting Share a Plate API..."
exec node src/index.js
