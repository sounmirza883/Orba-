-- 001_init_tenants.sql
-- Tenants (one per NexusHub deployment, multi-tenant ready) + membership tiers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,  -- subdomain/domain slug
  name         TEXT NOT NULL,
  domain       TEXT,                  -- custom domain (e.g. community.mysite.com)
  logo_url     TEXT,
  accent_color TEXT DEFAULT '#6366F1',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE membership_tiers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,          -- 'Free', 'Pro', 'VIP'
  price_cents INTEGER NOT NULL DEFAULT 0,
  interval    TEXT DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  stripe_price_id TEXT,
  is_free     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX membership_tiers_tenant_idx ON membership_tiers(tenant_id);
