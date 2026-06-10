import { createServerClient } from '@/lib/supabase/server';

/** Owner analytics: member count, posts this week, active members (PRD §6). */
export default async function DashboardPage() {
  const supabase = await createServerClient();

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [{ count: memberCount }, { count: postsThisWeek }, { count: activeMembers }] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen_at', weekAgo),
    ]);

  const stats = [
    { label: 'Total members', value: memberCount ?? 0 },
    { label: 'Posts this week', value: postsThisWeek ?? 0 },
    { label: 'Active members (7d)', value: activeMembers ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-foreground/60">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
