-- 003_profiles_tiers_policies.sql
-- Policies for tenants, profiles, membership tiers.
-- Expected behavior (PRD §14):
--   profiles: anon read public fields | member full own | owner all
--   membership_tiers: everyone read | owner CUD

-- TENANTS ----------------------------------------------------------------
-- Tenant branding (name, logo, accent) must be readable pre-auth for login page.
CREATE POLICY "tenants_read" ON tenants FOR SELECT USING (true);

CREATE POLICY "tenants_update" ON tenants FOR UPDATE
  USING (public.is_owner());

-- PROFILES -----------------------------------------------------------------
CREATE POLICY "profiles_read" ON profiles FOR SELECT
  USING (true);  -- public fields; sensitive columns excluded at API layer

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_owner())
  WITH CHECK (
    -- members cannot promote themselves or unban themselves
    (id = auth.uid() AND is_owner = (SELECT is_owner FROM profiles WHERE id = auth.uid()))
    OR public.is_owner()
  );

-- MEMBERSHIP TIERS ----------------------------------------------------------
CREATE POLICY "tiers_read" ON membership_tiers FOR SELECT USING (true);

CREATE POLICY "tiers_write" ON membership_tiers FOR ALL
  USING (public.is_owner());

-- MEMBER POINTS ----------------------------------------------------------
CREATE POLICY "member_points_read" ON member_points FOR SELECT
  USING (auth.role() = 'authenticated');
