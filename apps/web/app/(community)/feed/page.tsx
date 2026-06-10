'use client';

import Link from 'next/link';
import { useSpaces } from '@/lib/api/queries';

export default function FeedPage() {
  const { data: spaces, isLoading } = useSpaces();

  if (isLoading) {
    return <div className="card animate-pulse text-sm text-foreground/50">Loading spaces…</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Your Spaces</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {spaces?.map((space) => (
          <Link key={space.id} href={`/spaces/${space.slug}`} className="card hover:border-accent">
            <div className="text-2xl">{space.icon}</div>
            <div className="mt-2 font-medium">{space.name}</div>
            {space.description && (
              <p className="mt-1 text-sm text-foreground/60">{space.description}</p>
            )}
            {space.is_private && (
              <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-xs">
                Members only
              </span>
            )}
          </Link>
        ))}
        {spaces?.length === 0 && (
          <p className="text-sm text-foreground/60">No spaces yet. Ask the owner to create one!</p>
        )}
      </div>
    </div>
  );
}
