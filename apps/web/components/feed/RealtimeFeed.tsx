'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';

/**
 * Invisible component — subscribes to postgres_changes INSERTs on posts for
 * a space and invalidates the TanStack Query cache so the feed updates live.
 */
export function RealtimeFeed({ spaceId, spaceSlug }: { spaceId: string; spaceSlug: string }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`space-posts:${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `space_id=eq.${spaceId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['posts', spaceSlug] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [spaceId, spaceSlug, queryClient]);

  return null;
}
