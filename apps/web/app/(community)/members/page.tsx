'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Profile } from '@nexushub/shared-types';
import { apiFetch } from '@/lib/api/client';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: members } = useQuery({
    queryKey: ['members', search],
    queryFn: () =>
      apiFetch<Profile[]>(`/profiles${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });

  async function ban(userId: string) {
    if (!confirm('Ban this member?')) return;
    await apiFetch(`/profiles/${userId}/ban`, { method: 'POST' });
    void queryClient.invalidateQueries({ queryKey: ['members'] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Members</h1>
      <input
        className="input max-w-sm"
        placeholder="Search by name or username…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="card divide-y divide-border p-0">
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">{member.display_name ?? member.username}</div>
              <div className="text-xs text-foreground/50">
                Joined {new Date(member.created_at).toLocaleDateString()}
                {member.is_banned && <span className="ml-2 text-red-500">BANNED</span>}
              </div>
            </div>
            {!member.is_owner && !member.is_banned && (
              <button
                onClick={() => ban(member.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Ban
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
