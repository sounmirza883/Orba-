'use client';

import { useEffect, useState } from 'react';
import {
  useMyProfile,
  useNotificationPrefs,
  useUpdateNotificationPrefs,
  useUpdateProfile,
} from '@/lib/api/queries';

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[rgb(var(--accent))]"
      />
    </label>
  );
}

export default function SettingsPage() {
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const { data: prefs } = useNotificationPrefs();
  const updatePrefs = useUpdateNotificationPrefs();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setBio(profile.bio ?? '');
    }
  }, [profile]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile.mutateAsync({ displayName, bio });
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="card">
        <h2 className="mb-3 font-medium">Profile</h2>
        <form onSubmit={saveProfile} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-foreground/60">Display name</label>
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/60">Bio</label>
            <textarea
              className="input min-h-20"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
            />
          </div>
          <button className="btn-accent" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save profile'}
          </button>
          {updateProfile.isSuccess && (
            <span className="ml-3 text-sm text-green-600">Saved ✓</span>
          )}
        </form>
      </section>

      <section className="card">
        <h2 className="mb-1 font-medium">Email notifications</h2>
        <p className="mb-2 text-xs text-foreground/50">
          Choose which emails you want to receive.
        </p>
        {prefs ? (
          <div className="divide-y divide-border">
            <Toggle
              label="Replies to my posts"
              checked={prefs.email_replies}
              onChange={(v) => updatePrefs.mutate({ emailReplies: v })}
            />
            <Toggle
              label="Mentions"
              checked={prefs.email_mentions}
              onChange={(v) => updatePrefs.mutate({ emailMentions: v })}
            />
            <Toggle
              label="New posts in my spaces"
              checked={prefs.email_new_posts}
              onChange={(v) => updatePrefs.mutate({ emailNewPosts: v })}
            />
            <Toggle
              label="Weekly digest"
              checked={prefs.weekly_digest}
              onChange={(v) => updatePrefs.mutate({ weeklyDigest: v })}
            />
          </div>
        ) : (
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        )}
      </section>
    </div>
  );
}
