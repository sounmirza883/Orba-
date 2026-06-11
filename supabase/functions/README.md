# Supabase Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `send-weekly-digest` | pg_cron (Monday 9am) | Weekly top-posts email to opted-in members |
| `cleanup-old-notifications` | pg_cron (daily 3am) | Delete read notifications older than 90 days |

## Deploy

```bash
supabase functions deploy send-weekly-digest --project-ref <project-ref>
supabase functions deploy cleanup-old-notifications --project-ref <project-ref>

# Required secrets
supabase secrets set RESEND_API_KEY=re_... RESEND_FROM_EMAIL=digest@yourdomain.com BASE_URL=https://yourdomain.com
```

Then run `packages/database/migrations/007_scheduled_jobs.sql` (after replacing
`<project-ref>` and storing the service role key in Vault) to register the
pg_cron schedules.
