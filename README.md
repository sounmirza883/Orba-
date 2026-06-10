# NexusHub

**Self-hosted, white-label community & membership platform** — a developer-owned alternative to Circle and Skool with zero platform fees and no vendor lock-in.

Built on **Supabase** (PostgreSQL + Realtime + RLS + Storage + Auth) with a **NestJS microservices** backend and a **Next.js 15** frontend. See [docs/PRD.md](docs/PRD.md) for the full product spec.

## Monorepo Layout

```
apps/
├── web/                  # Next.js 15 frontend (App Router)
├── gateway/              # API Gateway — NestJS, port 3000
├── auth-service/         # Auth + Profiles — port 3001
├── community-service/    # Spaces + Posts + Comments + Reactions — port 3002
├── chat-service/         # DMs + Realtime presence — port 3003
├── membership-service/   # Tiers + Stripe + Webhooks — port 3004
├── media-service/        # Upload signing → Supabase Storage — port 3005
└── notification-service/ # Emails + In-app notifications — port 3006
packages/
├── shared-types/         # Shared TypeScript interfaces & NATS contracts
├── shared-config/        # Shared tsconfig / ESLint / Prettier
└── database/             # Supabase migrations + RLS policies + seeds
```

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in your Supabase/Stripe/Resend keys
cp .env.example .env

# 3. Apply database migrations to your Supabase project
#    (via Supabase CLI: supabase db push, or run packages/database/migrations in order)

# 4. Start the full stack (NATS + all services + web)
docker compose up
```

- Web app: http://localhost:3100
- API Gateway + Swagger docs: http://localhost:3000/docs
- NATS monitoring: http://localhost:8222

## Development

```bash
pnpm turbo build       # build all packages
pnpm turbo typecheck   # typecheck all packages
pnpm turbo lint        # lint all packages
pnpm turbo test        # run all test suites
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TanStack Query v5, shadcn/ui, Tailwind CSS |
| Backend | NestJS microservices over NATS JetStream |
| Database | Supabase PostgreSQL with Row Level Security |
| Auth | Supabase Auth (JWT, OAuth) |
| Payments | Stripe subscriptions |
| Email | Resend |
| CI/CD | GitHub Actions → Vercel (web) + Railway (services) |
