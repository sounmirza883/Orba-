'use client';

import { useSpacePosts } from '@/lib/api/queries';
import { PostCard } from '@/components/feed/PostCard';
import { PostEditor } from '@/components/feed/PostEditor';
import { RealtimeFeed } from '@/components/feed/RealtimeFeed';
import { PresenceBadge } from '@/components/feed/PresenceBadge';

export function SpaceFeed({
  spaceId,
  spaceSlug,
  userId,
}: {
  spaceId: string;
  spaceSlug: string;
  userId: string;
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSpacePosts(spaceSlug);

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PresenceBadge spaceId={spaceId} userId={userId} />
      </div>

      <PostEditor spaceSlug={spaceSlug} />
      <RealtimeFeed spaceId={spaceId} spaceSlug={spaceSlug} />

      {isLoading && <div className="card h-24 animate-pulse" />}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {posts.length === 0 && !isLoading && (
        <p className="py-8 text-center text-sm text-foreground/50">
          No posts yet — be the first to share something!
        </p>
      )}

      {hasNextPage && (
        <button
          className="input hover:bg-muted"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
