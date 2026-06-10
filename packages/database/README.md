# @nexushub/database

Supabase migrations, RLS policies, and seed data.

## Apply order

1. `migrations/*.sql` in numeric order (001 → 006)
2. `rls/*.sql` in numeric order (001 → 006)
3. `seed/seed.sql` (local/dev only)

## With Supabase CLI

```bash
supabase link --project-ref <your-project-ref>
for f in migrations/*.sql rls/*.sql; do
  supabase db execute --file "$f"
done
```

Or paste each file into the Supabase SQL editor in order.

## Notes

- `rls/001_enable_rls.sql` defines two SECURITY DEFINER helpers used by all
  policies: `public.is_owner()` and `public.has_space_access(uuid)`.
- DM messages have deliberately **no owner read override** — only thread
  participants can read messages (PRD §14).
- Storage buckets and object policies live in `rls/006_storage_policies.sql`.
