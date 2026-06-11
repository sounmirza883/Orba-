// Supabase Edge Function: send-weekly-digest
// Triggered by pg_cron every Monday 9am (see migrations/007_scheduled_jobs.sql).
// Emails the week's top posts to every member with weekly_digest enabled.

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!authHeader.includes(serviceRoleKey)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey);

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  // Top 5 posts of the week by reaction count
  const { data: topPosts } = await supabase
    .from('posts')
    .select('id, title, reaction_count, comment_count')
    .gte('created_at', weekAgo)
    .eq('is_hidden', false)
    .order('reaction_count', { ascending: false })
    .limit(5);

  if (!topPosts || topPosts.length === 0) {
    return Response.json({ sent: 0, reason: 'no posts this week' });
  }

  // Members who opted into the digest
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('weekly_digest', true);

  const userIds = (prefs ?? []).map((p) => p.user_id as string);

  const baseUrl = Deno.env.get('BASE_URL') ?? '';
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'digest@localhost';

  const postList = topPosts
    .map(
      (p) =>
        `<li><a href="${baseUrl}/posts/${p.id}">${p.title ?? 'Untitled post'}</a> — ${p.reaction_count} reactions, ${p.comment_count} comments</li>`,
    )
    .join('');

  let sent = 0;
  for (const userId of userIds) {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;
    if (!email || !resendKey) continue;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: 'Your weekly community digest',
        html: `
          <div style="font-family: sans-serif; max-width: 520px;">
            <h2>This week in your community</h2>
            <ol>${postList}</ol>
            <p style="color:#888;font-size:12px;">
              You can turn off this digest in your notification settings.
            </p>
          </div>`,
      }),
    });
    if (res.ok) sent++;
  }

  return Response.json({ sent, recipients: userIds.length, topPosts: topPosts.length });
});
