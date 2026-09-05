# HTTP API Reference

Base URL: the Express server, e.g. `http://localhost:4000` (configure the web
app with `NEXT_PUBLIC_API_URL`).

## Conventions

- JSON in / JSON out.
- Successful responses: `{ "status": "success", "data": … }` (auth/register and
  donor endpoints may also include `message`).
- Errors: `{ "status": "error" | "fail", "message": … }` with an appropriate
  HTTP status code.
- **Auth:** bearer tokens via `Authorization: Bearer <token>`.
  - Admin endpoints expect a **Clerk session token** for a user whose role is
    `admin`.
  - Charity endpoints expect the **app-level JWT** returned by
    `POST /api/auth/login`.

## Health

| Method | Path          | Notes                       |
| ------ | ------------- | --------------------------- |
| GET    | `/api/health` | Liveness probe (`{status}`) |

## Authentication (charity app-level accounts)

| Method | Path              | Auth  | Notes                                  |
| ------ | ----------------- | ----- | -------------------------------------- |
| POST   | `/api/auth/register` | no | Create charity account + profile        |
| POST   | `/api/auth/login`    | no | Login, returns app JWT + user           |
| GET    | `/api/auth/me`       | yes | Current user                            |

## Donations (donor module + rescue feed)

| Method | Path                            | Notes                                        |
| ------ | ------------------------------- | -------------------------------------------- |
| GET    | `/api/donations`                | List listings (`?status=`, `?query=`)         |
| GET    | `/api/donations/metrics`        | Dashboard totals                             |
| POST   | `/api/donations`                | Publish a donation                           |
| PATCH  | `/api/donations/:id/status`     | Update status (e.g. `collected`)             |
| GET    | `/api/donations/feed`           | Charity live feed (`?city=&dietary=&category=&search=`) |
| GET    | `/api/donations/:id`            | Donation details (feed)                      |
| POST   | `/api/donations/:id/reserve`    | Charity reserves a donation                  |
| GET    | `/api/donations/reservations/:id` | Reservation detail                         |

## Admin API (protected – Clerk admin JWT)

All endpoints are mounted at `/api/admin` behind the admin role guard.

### Dashboard

| Method | Path              | Notes                                             |
| ------ | ----------------- | ------------------------------------------------- |
| GET    | `/overview`       | Counts by status (restaurants, charities, donations), rescued kg |

### Restaurant & charity management

| Method | Path                     | Notes                                            |
| ------ | ------------------------ | ------------------------------------------------ |
| GET    | `/restaurants`           | `?status=` (pending/active/suspended/rejected), `?q=` |
| PATCH  | `/restaurants/:id`       | Body `{ "action": "verify" \| "suspend" \| "reject" }` |
| GET    | `/charities`             | `?status=` (pending/active/rejected), `?q=`      |
| PATCH  | `/charities/:id`         | Body `{ "action": "verify" \| "reject" }`         |

### Donation monitoring

| Method | Path                        | Notes                                 |
| ------ | --------------------------- | ------------------------------------- |
| GET    | `/donations`                | `?status=` or `?flagged=true`          |
| POST   | `/donations/:id/flag`       | Body `{ "reason": "…" }`               |
| POST   | `/donations/:id/remove`     | Marks listing removed                  |

### Impact & reports

| Method | Path                      | Notes                                        |
| ------ | ------------------------- | -------------------------------------------- |
| GET    | `/impact`                 | Total kg, meals served, week/month, by-category, trend, top donors & charities |
| GET    | `/reports/monthly`        | `?year=` – per-month kg / rescues / portions  |
| GET    | `/reports/restaurants`    | Contribution table per donor                 |
| GET    | `/reports/charities`      | Recipient table per charity                  |

## Examples

```bash
# Health
curl http://localhost:4000/api/health

# Live charity feed
curl "http://localhost:4000/api/donations/feed?city=Colombo"

# Donor listing metrics
curl http://localhost:4000/api/donations/metrics

# Register a charity (app-level auth)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "org@example.com", "password": "secret", "role": "CHARITY", "orgName": "Hope Home", "charityType": "ORPHANAGE", "contactPerson": "A", "phone": "+94..", "address": "1 Main St", "city": "Colombo" }'

# Admin overview (requires a Clerk admin session token)
curl http://localhost:4000/api/admin/overview \
  -H "Authorization: Bearer <clerk_session_token>"
```
