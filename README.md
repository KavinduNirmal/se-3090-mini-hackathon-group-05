# Share a Plate

**Turn today's surplus into someone's meal tonight.**

Share a Plate connects restaurants, hotels, bakeries and caterers with verified
children's homes, shelters and community kitchens so that good, safe surplus
food is rescued and redistributed instead of thrown away.

Built as the **Group 05** submission for the **SE3090 Mini-Hackathon**, this
repository contains a full-stack food-rescue platform split across a Next.js
web app and an Express + Prisma backend.

---

## Highlights

- **Donor logistics desk** – restaurants list surplus meals with portions,
  dietary certifications, hygiene handling and real pickup windows.
- **Charity rescue feed** – verified organizations browse a live feed, filter by
  city / dietary type / category, reserve donations and track them to pickup.
- **Admin + impact console** – verify or reject suppliers & charities, monitor
  and moderate every donation, flag or remove invalid listings, and view
  impact analytics and monthly reports.
- **Impact analytics** – total kg rescued, estimated meals served (≈ 0.4 kg per
  meal), category breakdowns, monthly trends, top donating restaurants and top
  charity recipients, and an impact leaderboard.
- **Role-aware auth** – Clerk-backed sign-in with role-based destinations
  (donor / charity / admin), admin-only API & page guards, and 2FA support.

---

## Tech stack

| Area        | Technology                                                        |
| ----------- | ----------------------------------------------------------------- |
| Frontend    | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4     |
| UI          | Radix primitives + shadcn-style components, Lucide icons, recharts |
| Backend     | Express 5, modular monolith, zod validation                        |
| Database    | PostgreSQL on Neon (Prisma 6 + node-postgres driver adapter)      |
| Auth        | Clerk (donors & admins), app-level email/password (charity flow)  |
| Tooling     | pnpm workspaces, Node ≥ 20                                        |
| Deploy      | Vercel (web), Azure App Service via Docker + GitHub Actions       |

---

## Repository layout

```
apps/
  web/      # Next.js frontend (donor, charity & admin experiences)
    app/            # App Router pages (/(auth), /donor, /charity, /admin)
    components/     # UI kit (ui/) + feature components (admin/, donor/, ...)
    lib/            # api client, account types, server-side admin/session helpers
  server/   # Express API + Prisma schema/migrations
    src/
      config/       # env + Prisma client bootstrap
      modules/      # admin / auth / donors / rescue (presentation → business → persistence)
      shared/       # errors, middleware (e.g. requireAdminApi), utils
      scripts/      # seed, promote-admin
prisma/ …           # schema + SQL migrations (apps/server/prisma)
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture and
data-model walkthrough and [docs/API.md](docs/API.md) for the HTTP API
reference. Deployment details live in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Getting started

### Prerequisites

- Node.js **≥ 20**
- pnpm **11.x** (`corepack enable` will pick up `packageManager: pnpm@11.2.2`)
- A **PostgreSQL** database (e.g. Neon) and a **Clerk** application

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

**API server** — create `apps/server/.env` from `apps/server/env.example`:

| Variable                  | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`            | Pooled Postgres connection string                    |
| `DIRECT_URL`              | Direct/unpooled connection string (Prisma Migrate)   |
| `PORT`                    | API port (default `4000`)                            |
| `CORS_ORIGIN`             | Allowed browser origins                              |
| `CLERK_SECRET_KEY`        | Clerk secret key (verifies admin API JWTs)           |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                     |

**Web app** — create `apps/web/.env.local` from `apps/web/.env.example`:

| Variable                             | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                | URL of the Express API (`http://localhost:4000`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Clerk publishable key                          |
| `CLERK_SECRET_KEY`                   | Clerk secret key (server-side)                 |

### 3. Prepare the database

```bash
pnpm db:migrate        # apply Prisma migrations
pnpm --filter server seed   # load realistic demo data
```

> You can also use `pnpm db:push` (no migration history) or `pnpm db:studio`
> to browse the data.

### 4. Run locally

```bash
pnpm dev
```

- Web app: <http://localhost:3000>
- API + health check: <http://localhost:4000/api/health>

---

## Useful scripts

| Command                          | What it does                                    |
| -------------------------------- | ----------------------------------------------- |
| `pnpm dev` / `pnpm build`        | Run / build both workspace apps                 |
| `pnpm db:generate`               | Regenerate the Prisma client                    |
| `pnpm db:migrate` / `pnpm db:push` | Migrate or sync the database                  |
| `pnpm db:studio`                 | Open Prisma Studio                              |
| `pnpm --filter server seed`      | Seed restaurants, charities & donations         |
| `pnpm --filter server admin:promote <email>` | Grant `admin` role to a Clerk user  |

---

## Authentication & roles

- **Donor & admin** accounts are managed by **Clerk**. The chosen role is
  stored in Clerk user metadata.
- The **charity** experience uses app-level email/password accounts persisted
  in the database (`users`, `charity_profiles`).
- After sign-in, users are routed to their role home. **Admin-only** pages are
  guarded server-side and the `/api/admin/*` API is protected by a Clerk
  session check that requires `publicMetadata.role === 'admin'`.
- Second-factor (2FA) sign-in is supported when an account has it enabled.

To make a user an administrator:

```bash
pnpm --filter server admin:promote you@example.com
```

---

## Documentation

- [Architecture & data model](docs/ARCHITECTURE.md)
- [HTTP API reference](docs/API.md)
- [Deployment guide](DEPLOYMENT.md)
- [Design system](.agents/brain/DESIGN.md) (colors, typography, elevation)

## License

Private project – part of the SE3090 Mini-Hackathon, Group 05.
