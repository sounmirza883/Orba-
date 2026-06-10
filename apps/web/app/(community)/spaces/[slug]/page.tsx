import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { SpaceFeed } from './SpaceFeed';

/** Server Component: resolves the space and streams the client feed (PRD §10). */
export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // Next.js 15: params is async
  const supabase = await createServerClient();

  const { data: space } = await supabase
    .from('spaces')
    .select('id, name, slug, description, icon, is_private')
    .eq('slug', slug)
    .single();

  if (!space) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold">
          {space.icon} {space.name}
        </h1>
        {space.description && <p className="text-sm text-foreground/60">{space.description}</p>}
      </header>
      <Suspense fallback={<div className="card animate-pulse h-24" />}>
        <SpaceFeed spaceId={space.id} spaceSlug={space.slug} userId={user?.id ?? ''} />
      </Suspense>
    </div>
  );
}
