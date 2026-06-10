-- 002_profiles.sql
-- Profiles extend Supabase Auth users 1:1.

CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id    UUID REFERENCES tenants(id),
  username     TEXT UNIQUE,
  display_name TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  tier_id      UUID REFERENCES membership_tiers(id),
  stripe_customer_id TEXT,
  is_owner     BOOLEAN DEFAULT false,
  is_banned    BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX profiles_tenant_idx ON profiles(tenant_id);
CREATE INDEX profiles_tier_idx ON profiles(tier_id);

-- Auto-create a profile row whenever a Supabase Auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
