'use client';

import Link from 'next/link';
import type { Post } from '@nexushub/shared-types';
import { useToggleReaction } from '@/lib/api/queries';
import { useState } from 'react';

interface PostAuthor {
  display_name: string | null;
  avatar_url: string | null;
}

/** Render TipTap JSON to plain text preview (full render on detail page). */
function extractText(node: unknown): string {
  if (node == null || typeof node !== 'object') return '';
  const n = node as { text?: string; content?: unknown[] };
  if (typeof n.text === 'string') return n.text;
  return (n.content ?? []).map(extractText).join(' ');
}

export function PostCard({ post }: { post: Post & { author?: PostAuthor | null } }) {
  const toggleReaction = useToggleReaction();
  const [reactionCount, setReactionCount] = useState(post.reaction_count);
  const preview = extractText(post.body).slice(0, 280);

  async function react() {
    // Optimistic update; server toggle decides final state
    const { reacted } = await toggleReaction.mutateAsync({
      targetId: post.id,
      targetType: 'post',
      emoji: '👍',
    });
    setReactionCount((c) => (reacted ? c + 1 : Math.max(c - 1, 0)));
  }

  return (
    <article className="card">
      <div className="flex items-center gap-2 text-sm text-foreground/60">
        {post.author?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.author.avatar_url} alt="" className="h-6 w-6 rounded-full" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
            {post.author?.display_name?.[0] ?? '?'}
          </span>
        )}
        <span>{post.author?.display_name ?? 'Unknown'}</span>
        <span>·</span>
        <time>{new Date(post.created_at).toLocaleDateString()}</time>
        {post.is_pinned && <span className="ml-auto text-xs">📌 Pinned</span>}
      </div>

      <Link href={`/posts/${post.id}`} className="mt-2 block">
        {post.title && <h2 className="font-semibold">{post.title}</h2>}
        <p className="mt-1 text-sm text-foreground/80">{preview}</p>
      </Link>

      <div className="mt-3 flex items-center gap-4 text-sm text-foreground/60">
        <button onClick={react} className="hover:text-foreground">
          👍 {reactionCount}
        </button>
        <Link href={`/posts/${post.id}`} className="hover:text-foreground">
          💬 {post.comment_count}
        </Link>
      </div>
    </article>
  );
}
