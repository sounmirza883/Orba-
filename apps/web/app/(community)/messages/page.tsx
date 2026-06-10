'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { DmMessage, DmThread, PaginatedResult } from '@nexushub/shared-types';
import { apiFetch } from '@/lib/api/client';
import { createBrowserClient } from '@/lib/supabase/client';

type ThreadWithMeta = DmThread & {
  participants?: { user_id: string; profile?: { display_name: string | null } }[];
  latest?: { body: string }[];
};

export default function MessagesPage() {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const queryClient = useQueryClient();

  const { data: threads } = useQuery({
    queryKey: ['dm-threads'],
    queryFn: () => apiFetch<ThreadWithMeta[]>('/dms'),
  });

  const { data: messages } = useQuery({
    queryKey: ['dm-messages', activeThread],
    queryFn: () =>
      apiFetch<PaginatedResult<DmMessage>>(`/dms/${activeThread}/messages`),
    enabled: !!activeThread,
  });

  // Realtime DM delivery via Supabase Broadcast on dm-thread:{threadId}
  useEffect(() => {
    if (!activeThread) return;
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`dm-thread:${activeThread}`)
      .on('broadcast', { event: 'new-message' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['dm-messages', activeThread] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeThread, queryClient]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeThread) return;
    await apiFetch(`/dms/${activeThread}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body: draft }),
    });
    setDraft('');
    void queryClient.invalidateQueries({ queryKey: ['dm-messages', activeThread] });
  }

  return (
    <div className="grid h-[70vh] grid-cols-3 gap-4">
      <div className="card overflow-y-auto">
        <h1 className="mb-3 font-semibold">Messages</h1>
        {threads?.map((thread) => (
          <button
            key={thread.id}
            onClick={() => setActiveThread(thread.id)}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${activeThread === thread.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
          >
            <div className="font-medium">
              {thread.participants?.map((p) => p.profile?.display_name).filter(Boolean).join(', ') ||
                'Conversation'}
            </div>
            <div className="truncate text-xs opacity-70">{thread.latest?.[0]?.body ?? ''}</div>
          </button>
        ))}
        {threads?.length === 0 && (
          <p className="text-sm text-foreground/50">No conversations yet.</p>
        )}
      </div>

      <div className="card col-span-2 flex flex-col">
        {activeThread ? (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {[...(messages?.items ?? [])].reverse().map((m) => (
                <div key={m.id} className="rounded-lg bg-muted px-3 py-2 text-sm">
                  {m.body}
                </div>
              ))}
            </div>
            <form onSubmit={send} className="mt-3 flex gap-2">
              <input
                className="input"
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button className="btn-accent">Send</button>
            </form>
          </>
        ) : (
          <p className="m-auto text-sm text-foreground/50">Select a conversation</p>
        )}
      </div>
    </div>
  );
}
