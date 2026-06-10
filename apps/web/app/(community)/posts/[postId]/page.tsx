'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '@nexushub/shared-types';
import { apiFetch } from '@/lib/api/client';
import { useCreateComment, usePostComments } from '@/lib/api/queries';

function renderText(node: unknown): string {
  if (node == null || typeof node !== 'object') return '';
  const n = node as { text?: string; content?: unknown[] };
  if (typeof n.text === 'string') return n.text;
  return (n.content ?? []).map(renderText).join('\n');
}

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const [comment, setComment] = useState('');

  const { data: post } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => apiFetch<Post & { author?: { display_name: string | null } }>(`/posts/${postId}`),
  });
  const { data: comments } = usePostComments(postId);
  const createComment = useCreateComment(postId);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    await createComment.mutateAsync({ body: comment });
    setComment('');
  }

  if (!post) return <div className="card h-40 animate-pulse" />;

  return (
    <div className="space-y-4">
      <article className="card">
        <div className="text-sm text-foreground/60">
          {post.author?.display_name ?? 'Unknown'} ·{' '}
          {new Date(post.created_at).toLocaleString()}
        </div>
        {post.title && <h1 className="mt-2 text-xl font-semibold">{post.title}</h1>}
        <p className="mt-2 whitespace-pre-wrap text-sm">{renderText(post.body)}</p>
      </article>

      <section className="space-y-3">
        <h2 className="font-medium">Comments ({comments?.length ?? 0})</h2>

        <form onSubmit={submitComment} className="flex gap-2">
          <input
            className="input"
            placeholder="Write a comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn-accent" disabled={createComment.isPending}>
            Reply
          </button>
        </form>

        {comments?.map((c) => (
          <div key={c.id} className="card">
            <div className="text-xs text-foreground/60">
              {(c as { author?: { display_name?: string } }).author?.display_name ?? 'Unknown'} ·{' '}
              {new Date(c.created_at).toLocaleString()}
            </div>
            <p className="mt-1 text-sm">{c.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
