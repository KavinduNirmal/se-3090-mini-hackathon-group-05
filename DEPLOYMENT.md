# Deployment Guide

**Share a Plate** — Next.js frontend on **Vercel**, Express + Prisma backend on
**Azure App Service** (Linux container). Public site: `https://share-a-plate.kavindunirmal.com`
, API: `https://api.share-a-plate.kavindunirmal.com`.

Monorepo layout:

| Path         | App      | Host  |
|--------------|----------|-------|
| `apps/web`   | Next.js  | Vercel |
| `apps/server`| Express  | Azure App Service (Docker) |

---

## 1. Frontend → Vercel

Vercel's GitHub integration handles the deploy (PR previews + production on
`master`). No GitHub Actions needed for the web app.

1. **Push this repo** to GitHub (`origin` is already set).
2. In Vercel → **Add New Project → Import** the GitHub repo.
   - Root `vercel.json` points at `apps/web` (`rootDirectory`). If Vercel does
     not pick it up automatically, set **Root Directory → `apps/web`** in
     project settings. Framework auto-detects as **Next.js**.
   - Build command `next build`, install command `pnpm install --frozen-lockfile`
     (from the root `vercel.json`).
3. **Project → Settings → Environment Variables** (Production):

   | Variable                            | Value                                              |
   |-------------------------------------|----------------------------------------------------|
   | `NEXT_PUBLIC_API_URL`               | `https://api.share-a-plate.kavindunirmal.com`      |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | from Clerk (dashboard.clerk.com)                   |
   | `CLERK_SECRET_KEY`                  | from Clerk                                         |

4. **Deploy**, then add the custom domain:
   **Settings → Domains → `share-a-plate.kavindunirmal.com`**. Vercel shows the
   DNS record to add at the `kavindunirmal.com` zone:
   ```
   CNAME  share-a-plate  →  cname.vercel-dns.com
   ```
   Vercel provisions TLS automatically.

---

## 2. Backend → Azure

Deploys happen via `.github/workflows/deploy-backend.yml`, which on every push
touching `apps/server/**`:
1. builds `Dockerfile` (repo root) → pushes `share-a-plate/server` to ACR,
2. points the App Service at the new image,
3. syncs app settings from GitHub Secrets,
4. restarts the app and waits for `/api/health` to return `200`.

### 2.1 Provision Azure resources (one-time)

Run with the [Azure CLI](https://learn.microsoft.com/cli/azure) logged in:

```bash
RG=rg-share-a-plate
LOCATION=eastasia

az group create -n $RG -l $LOCATION

# Container registry (name must be globally unique)
az acr create -n sapShareAPlate --resource-group $RG \
  --sku Basic --admin-enabled true

# Linux App Service plan + web app (custom container)
az appservice plan create -n asp-share-a-plate --resource-group $RG \
  --sku B1 --is-linux
az webapp create -n share-a-plate-api --resource-group $RG \
  --plan asp-share-a-plate \
  --deployment-container-image-name sapshareaplate.azurecr.io/share-a-plate/server:latest
```

### 2.2 Create the GitHub Actions identity

```bash
az ad sp create-for-rbac -n "gh-share-a-plate" \
  --role Contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/$RG \
  --sdk-auth
```

Paste the returned JSON into the GitHub secret **`AZURE_CREDENTIALS`**.

### 2.3 GitHub repo settings

**Settings → Secrets and variables → Actions**:

| Type     | Name                                   | Value                                             |
|----------|----------------------------------------|---------------------------------------------------|
| Secret   | `AZURE_CREDENTIALS`                    | service-principal JSON from 2.2                   |
| Secret   | `DATABASE_URL`                         | Neon pooled URL (matches local `.env`)            |
| Secret   | `DIRECT_URL`                           | Neon direct URL                                   |
| Secret   | `CLERK_SECRET_KEY`                     | Clerk server key                                  |
| Secret   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`    | Clerk publishable key                             |
| Secret   | `CORS_ORIGIN`                          | `https://share-a-plate.kavindunirmal.com`         |
| Variable | `AZURE_REGISTRY`                       | `sapShareAPlate` (the ACR name)                   |
| Variable | `AZURE_RESOURCE_GROUP`                 | `rg-share-a-plate`                                |
| Variable | `AZURE_WEBAPP_NAME`                    | `share-a-plate-api`                               |

### 2.4 Databases & migrations

Postgres is **NeonDB** (unchanged). The container runs
`prisma migrate deploy` at boot (see `apps/server/docker-entrypoint.sh`) so
schema stays in sync automatically. DB URL/settings are delivered by the
deploy workflow's "Sync app settings" step.

### 2.5 Custom domain → API

1. Azure Portal → `share-a-plate-api` → **Custom domains** → **Add custom domain**
   `api.share-a-plate.kavindunirmal.com`. Copy the **domain verification ID**.
2. At the `kavindunirmal.com` DNS zone add:
   ```
   TXT   asuid.api.share-a-plate         = <domain verification ID>
   CNAME api.share-a-plate               = share-a-plate-api.azurewebsites.net
   ```
3. Validate in Azure, then map **TLS/SSL settings** (Let's Encrypt, automatic).

---

## 3. Local verification

```bash
# Frontend
pnpm --filter web build      # apps/web/.next

# Backend container (context = repo root)
docker build -t share-a-plate/server .
docker run --rm -p 4000:4000 \
  -e DATABASE_URL="$DATABASE_URL" -e DIRECT_URL="$DIRECT_URL" \
  share-a-plate/server       # -> http://localhost:4000/api/health
```

## 4. Notes & troubleshooting

- **Ports:** Azure App Service injects `PORT`; `apps/server/src/config/env.js`
  already binds `process.env.PORT ?? 4000`.
- **Monorepo builds:** Vercel and Docker both run `pnpm` from the repo root
  lockfile. Don't commit per-app lockfiles (`apps/*/package-lock.json` is
  gitignored).
- **Secrets:** all `.env` files are gitignored — set values in Vercel project
  env and GitHub Actions secrets, never in the repo.
- If a deploy pushes while other feature work is uncommitted, only **committed**
  files are deployed; `git push` before expecting a live change.
