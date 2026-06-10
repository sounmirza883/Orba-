'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useMyProfile, useNotifications } from '@/lib/api/queries';

export function TopNav() {
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;

  async function signOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <div />
      <div className="flex items-center gap-3">
        <span className="relative text-lg" title={`${unread} unread notifications`}>
          🔔
          {unread > 0 && (
            <span className="absolute -right-2 -top-1 rounded-full bg-accent px-1.5 text-xs text-accent-foreground">
              {unread}
            </span>
          )}
        </span>
        <span className="text-sm text-foreground/70">{profile?.display_name}</span>
        <button onClick={signOut} className="text-sm text-foreground/50 hover:text-foreground">
          Sign out
        </button>
      </div>
    </header>
  );
}
