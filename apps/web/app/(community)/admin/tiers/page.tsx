'use client';

import { useState } from 'react';
import { useCreateTier, useTiers } from '@/lib/api/queries';

export default function AdminTiersPage() {
  const { data: tiers } = useTiers();
  const createTier = useCreateTier();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [interval, setInterval] = useState<'month' | 'year'>('month');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createTier.mutateAsync({
      name,
      priceCents: Math.round(parseFloat(price || '0') * 100),
      interval,
    });
    setName('');
    setPrice('0');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Membership Tiers</h1>

      <form onSubmit={submit} className="card max-w-lg space-y-3">
        <h2 className="font-medium">Create a tier</h2>
        <input
          className="input"
          placeholder="Name (e.g. Pro)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/50">
              $
            </span>
            <input
              className="input pl-7"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <select
            className="input w-32"
            value={interval}
            onChange={(e) => setInterval(e.target.value as 'month' | 'year')}
          >
            <option value="month">/ month</option>
            <option value="year">/ year</option>
          </select>
        </div>
        <p className="text-xs text-foreground/50">
          Paid tiers automatically create a Stripe product and recurring price. $0 = free tier.
        </p>
        <button className="btn-accent" disabled={createTier.isPending}>
          {createTier.isPending ? 'Creating…' : 'Create tier'}
        </button>
        {createTier.isError && (
          <p className="text-sm text-red-600">{(createTier.error as Error).message}</p>
        )}
      </form>

      <div className="card divide-y divide-border p-0">
        {tiers?.map((tier) => (
          <div key={tier.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">{tier.name}</div>
              <div className="text-xs text-foreground/50">
                {tier.is_free || tier.price_cents === 0
                  ? 'Free'
                  : `$${(tier.price_cents / 100).toFixed(2)} / ${tier.interval}`}
                {tier.stripe_price_id && ' · Stripe connected'}
              </div>
            </div>
          </div>
        ))}
        {tiers?.length === 0 && (
          <p className="px-4 py-6 text-sm text-foreground/50">No tiers yet.</p>
        )}
      </div>
    </div>
  );
}
