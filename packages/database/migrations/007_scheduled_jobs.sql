-- 007_scheduled_jobs.sql
-- pg_cron schedules calling Edge Functions via pg_net (PRD §9, §11).
--
-- BEFORE RUNNING: replace <project-ref> with your Supabase project ref and
-- store the service role key in Vault:
--   SELECT vault.create_secret('YOUR_SERVICE_ROLE_KEY', 'service_role_key');

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Weekly digest email — 9am every Monday
SELECT cron.schedule(
  'weekly-digest',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/send-weekly-digest',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Cleanup read notifications older than 90 days — daily at 3am
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/cleanup-old-notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
