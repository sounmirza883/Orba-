# Self-Hosting NexusHub

NexusHub runs anywhere Docker runs. Total cost: **~$20–50/mo** (a small VPS + Supabase free/pro tier), versus $99–219/mo for Skool/Circle — and you keep 100% of membership revenue minus Stripe fees.

## 1. Supabase project (10 minutes)

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) (free tier works to start).
2. In the **SQL editor**, run in order:
   - `packages/database/migrations/001` → `007`
   - `packages/database/rls/001` → `006`
   - `packages/database/seed/seed.sql` (optional demo data)
3. **Auth → Providers**: enable Email; optionally add Google and GitHub OAuth (set the callback to `https://yourdomain.com/api/auth/callback`).
4. Deploy the Edge Functions:
   ```bash
   supabase functions deploy send-weekly-digest --project-ref <ref>
   supabase functions deploy cleanup-old-notifications --project-ref <ref>
   supabase secrets set RESEND_API_KEY=re_... RESEND_FROM_EMAIL=digest@yourdomain.com BASE_URL=https://yourdomain.com
   ```
5. Copy from **Settings → API**: project URL, anon key, service role key → into `.env`.

## 2. Stripe (paid tiers)

1. Get your secret key from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) → `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint pointing to `https://yourdomain.com:3004/webhooks/stripe` (or your routed membership-service URL) with events:
   `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`.
3. Copy the signing secret → `STRIPE_WEBHOOK_SECRET`.

Tiers created in **Admin → Tiers** automatically create Stripe products and recurring prices.

## 3. Deployment options

### Option A — Single VPS with Docker Compose (cheapest, ~$20/mo)

Any 2GB+ VPS (Hetzner, DigitalOcean, Vultr):

```bash
git clone <your-fork> nexushub && cd nexushub
cp .env.example .env   # fill in keys from steps 1-2
docker compose -f docker-compose.prod.yml up -d --build
```

Put a reverse proxy in front for TLS. Example Caddyfile:

```
yourdomain.com {
    reverse_proxy localhost:3100
}
api.yourdomain.com {
    reverse_proxy localhost:3000
}
```

Caddy issues Let's Encrypt certificates automatically — including for member custom domains if you use [on-demand TLS](https://caddyserver.com/docs/automatic-https#on-demand-tls).

### Option B — Railway (managed, ~$20-40/mo)

1. Create a Railway project, add a service per app (gateway, auth, community, chat, membership, media, notification) pointing at the matching `apps/*/Dockerfile`, plus a NATS service from the `nats:2.10-alpine` image.
2. Set the shared env vars on each service (`NATS_URL=nats://nats.railway.internal:4222`, Supabase keys, etc.).
3. The repo's `deploy-services.yml` workflow auto-deploys every service on push to `main` once `RAILWAY_TOKEN` is set in GitHub secrets.

Deploy the frontend to **Vercel** (set `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets; `deploy-frontend.yml` handles the rest). Root directory: `apps/web`.

### Option C — Coolify / Render

Both consume `docker-compose.prod.yml` directly (Coolify: "Docker Compose" resource; Render: Blueprint from the compose file). Point them at your fork, supply the env vars, deploy.

## 4. Custom member domains (white-label)

V1 approach (PRD Q2): members point a **Cloudflare-proxied CNAME** at your web deployment. The Next.js middleware looks up the hostname in `tenants.domain` and rewrites to the tenant's routes. Add the domain to the tenant row:

```sql
UPDATE tenants SET domain = 'community.theirsite.com' WHERE slug = 'their-slug';
```

## 5. Checklist before going live

- [ ] All migrations + RLS applied (`007` registers the cron jobs)
- [ ] Edge Functions deployed with secrets set
- [ ] Stripe webhook verified (send a test event from the Stripe dashboard)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` present **only** in backend env, never `NEXT_PUBLIC_*`
- [ ] First account promoted to owner: `UPDATE profiles SET is_owner = true WHERE id = '<your-user-id>';`
- [ ] Tenant branding set: name, logo, accent color in the `tenants` row
