# Deploy & Postgres alignment

## Local databases

| Mode | `DATABASE_URL` | Prisma `provider` |
|------|----------------|-------------------|
| Local smoke (default in repo) | `file:./dev.db` | `sqlite` in [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) |
| Docker Postgres | `postgresql://mutesound:mutesound_dev_pass_123@localhost:5432/mutesound?schema=public` | switch to `postgresql` (below) |
| Railway / hosted | Public proxy URL from Railway Connect | `postgresql` |

### Switch Prisma to PostgreSQL

1. In `backend/prisma/schema.prisma`, set:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set `DATABASE_URL` in `backend/.env` to the Postgres URL (Docker or Railway).
3. From repo root:

```bash
pnpm db:up   # if using docker-compose
pnpm --filter @mutesound/backend prisma:generate
pnpm --filter @mutesound/backend exec prisma migrate deploy
# or for fresh local: prisma migrate dev --name init_postgres
```

A reference copy of the same models with `provider = "postgresql"` lives at [`backend/prisma/schema.postgresql.prisma`](../backend/prisma/schema.postgresql.prisma). Copy it over `schema.prisma` when cutting over (or change the provider line only — models are already SQLite-compatible strings).

## Backend host

- Build: `pnpm build:backend`
- Start: `pnpm --filter @mutesound/backend start:prod`
- Env: JWT secrets, `GOOGLE_OAUTH_CLIENT_ID`, Firebase (`docs/firebase.md`), `CORS_ORIGINS` including production website + `chrome-extension://*`
- Health: `GET /v1` or hit `POST /v1/auth/login`

Update extension `host_permissions` / API base when moving off localhost.

## Website host

- Build: `pnpm build:web`
- Set `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_SITE_URL`
- Privacy/Terms URLs must be public for store listings (`docs/store-listing.md`)
