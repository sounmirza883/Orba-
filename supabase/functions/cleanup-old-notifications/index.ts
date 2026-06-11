// Supabase Edge Function: cleanup-old-notifications
// Triggered by pg_cron daily (see migrations/007_scheduled_jobs.sql).
// Deletes read notifications older than 90 days (PRD §11).

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!authHeader.includes(serviceRoleKey)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey);

  const cutoff = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();

  const { error, count } = await supabase
    .from('notifications')
    .delete({ count: 'exact' })
    .eq('is_read', true)
    .lt('created_at', cutoff);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ deleted: count ?? 0 });
});
