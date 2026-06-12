'use client';

import { useState } from 'react';
import { useCreateSpace, useDeleteSpace, useSpaces, useTiers } from '@/lib/api/queries';

const SPACE_TYPES = ['discussion', 'course', 'events', 'directory'] as const;

export default function AdminSpacesPage() {
  const { data: spaces } = useSpaces();
  const { data: tiers } = useTiers();
  const createSpace = useCreateSpace();
  const deleteSpace = useDeleteSpace();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💬');
  const [type, setType] = useState<(typeof SPACE_TYPES)[number]>('discussion');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tierIds, setTierIds] = useState<string[]>([]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createSpace.mutateAsync({
      name,
      slug,
      description: description || undefined,
      icon,
      type,
      isPrivate,
      tierIds: isPrivate ? tierIds : undefined,
    });
    setName('');
    setSlug('');
    setDescription('');
    setTierIds([]);
    setIsPrivate(false);
  }

  function toggleTier(tierId: string) {
    setTierIds((current) =>
      current.includes(tierId) ? current.filter((id) => id !== tierId) : [...current, tierId],
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Manage Spaces</h1>

      <form onSubmit={submit} className="card max-w-lg space-y-3">
        <h2 className="font-medium">Create a space</h2>
        <div className="flex gap-2">
          <input
            className="input w-16 text-center"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={4}
            aria-label="Icon"
          />
          <input
            className="input"
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, ''),
              );
            }}
            required
          />
        </div>
        <input
          className="input"
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          pattern="[a-z0-9-]+"
          required
        />
        <input
          className="input"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value as (typeof SPACE_TYPES)[number])}
        >
          {SPACE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Members-only (tier-gated)
        </label>
        {isPrivate && (
          <div className="space-y-1 rounded-lg bg-muted p-3">
            <div className="text-xs font-medium text-foreground/60">Tiers with access</div>
            {tiers?.map((tier) => (
              <label key={tier.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tierIds.includes(tier.id)}
                  onChange={() => toggleTier(tier.id)}
                />
                {tier.name}
                {tier.price_cents > 0 && ` ($${(tier.price_cents / 100).toFixed(0)}/${tier.interval})`}
              </label>
            ))}
          </div>
        )}
        <button className="btn-accent" disabled={createSpace.isPending}>
          {createSpace.isPending ? 'Creating…' : 'Create space'}
        </button>
        {createSpace.isError && (
          <p className="text-sm text-red-600">{(createSpace.error as Error).message}</p>
        )}
      </form>

      <div className="card divide-y divide-border p-0">
        {spaces?.map((space) => (
          <div key={space.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">
                {space.icon} {space.name}
                {space.is_private && (
                  <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">private</span>
                )}
              </div>
              <div className="text-xs text-foreground/50">
                /{space.slug} · {space.type}
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete "${space.name}" and all its posts?`)) {
                  deleteSpace.mutate(space.id);
                }
              }}
              className="text-sm text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
