'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

/** Who's online in this Space right now — Supabase Presence (PRD §9). */
export function PresenceBadge({ spaceId, userId }: { spaceId: string; userId: string }) {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase.channel(`space-presence:${spaceId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        setOnlineCount(Object.keys(channel.presenceState()).length);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void channel.track({ userId, onlineAt: new Date().toISOString() });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [spaceId, userId]);

  return (
    <span className="flex items-center gap-1 text-sm text-foreground/60">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      {onlineCount} online
    </span>
  );
}
