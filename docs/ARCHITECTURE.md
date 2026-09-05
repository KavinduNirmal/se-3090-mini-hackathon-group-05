# Architecture

Share a Plate is a **pnpm monorepo** with two applications and a shared
database schema.

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│   apps/web (Next.js 15)    │  HTTP  │   apps/server (Express 5)    │
│  ───────────────────────── │ ─────► │  ─────────────────────────── │
│  Donor portal              │  JSON  │  Modular monolith:           │
│  Charity feed & register   │        │   modules/{admin,auth,       │
│  Admin console + analytics │        │            donors,rescue}    │
│  Clerk session (donor/admin)│       │   presentation → business    │
└──────────────┬─────────────┘        │               → persistence  │
               │ Clerk (donor/admin)  │  shared/{errors,middleware}  │
               │ custom JWT (charity) └──────────────┬───────────────┘
               ▼                                     ▼
        clever-prawn.clerk.accounts.dev        Neon PostgreSQL
                                                (Prisma + pg adapter)
```

## Server layering

The Express app follows a **modular monolith** with clean layers per module so
future services can be extracted if needed:

- **`presentation/`** – Express routers + controllers (HTTP concerns).
- **`business/`** – services holding domain rules (status transitions,
  analytics/meals conversion, validation).
- **`persistence/`** – Prisma-backed repositories (data access only).

Routers are mounted in `apps/server/src/app.js`. Admin routes mount behind a
`requireAdminApi()` middleware that verifies the Clerk session token and checks
the admin role.

## Web layering

- **Server components** fetch protected admin data using a server-side helper
  (`apps/web/lib/server/admin.ts`) that forwards the Clerk session token to
  `/api/admin`.
- **Client components** own mutations (verify/reject/flag/remove, charity
  auth, feed) and call the API with a Bearer token, then `router.refresh()`.
- Shared design tokens come from `.agents/brain/DESIGN.md` and are implemented
  in `apps/web/app/globals.css` (light/dark themes via `next-themes`).

## Data model

Prisma schema lives at `apps/server/prisma/schema.prisma` (two SQL migrations
checked into `apps/server/prisma/migrations`).

Three model groups:

1. **Admin registries**
   - `Restaurant` – donor organizations (status: pending / active / suspended /
     rejected).
   - `Charity` – recipient organizations (status: pending / active / rejected).

2. **Donor listings (member-donor module)**
   - `Donation` – denormalized food listings (`donorName`, `category`,
     `portions`, `weightKg`, dietary tags, expiry, claimed-by-charity JSON,
     flagging for moderation).

3. **Charity & rescue domain**
   - `User` / `DonorProfile` / `CharityProfile` – app-level accounts.
   - `FoodDonation` – typed feed listings for the rescue flow.
   - `Reservation` – charity reservations with pickup status & verification.

Enums: `Role`, `UserStatus`, `DonorType`, `CharityType`, `FoodCategory`,
`DietaryType`, `DonationStatus`, `ReservationStatus`.

### Impact metrics

One serving is assumed to weigh **0.4 kg**. Impact figures (meals served,
category shares, monthly trend, leaderboards) are derived from rescued
(`collected`) donations in `modules/admin/business/adminService.js`.

## Authentication model

| Role    | Identity provider        | Guard                                          |
| ------- | ------------------------ | ---------------------------------------------- |
| Donor   | Clerk                    | role home `/donor`                             |
| Charity | App-level DB account     | charity dashboard/feed via custom JWT          |
| Admin   | Clerk + `role=admin`     | `/admin/*` server guard + `/api/admin` JWT     |

`pnpm --filter server admin:promote <email>` sets `publicMetadata.role` on a
Clerk user to grant admin access.

## Deployment topology

- **Web** → Vercel (`vercel.json`, framework preset Next.js). Root directory is
  set to `apps/web` in the Vercel project settings.
- **API** → Docker image (`Dockerfile`, `apps/server/docker-entrypoint.sh`)
  pushed to Azure Container Registry and deployed to Azure App Service by
  `.github/workflows/deploy-backend.yml`; `prisma migrate deploy` runs on boot.
- **Database** → Neon PostgreSQL. Credentials are provided through environment
  variables / secrets (never committed).

See [DEPLOYMENT.md](../DEPLOYMENT.md) for the end-to-end deployment runbook.
