import { describe, expect, it, vi } from 'vitest';
import { PostsService } from './posts.service';
import type { SupabaseService } from '@nexushub/nest-common';
import type { ClientProxy } from '@nestjs/microservices';
import type { SpacesService } from '../spaces/spaces.service';
import type { AuthenticatedUser, Post } from '@nexushub/shared-types';

const user: AuthenticatedUser = { id: 'u1', email: 'a@b.c', tenantId: 't1', isOwner: false };

function mockSupabase(rows: unknown[]): SupabaseService {
  const builder: Record<string, unknown> = {};
  const chain = (): Record<string, unknown> => builder;
  for (const method of [
    'from', 'select', 'insert', 'update', 'delete', 'eq', 'lt',
    'order', 'limit', 'textSearch',
  ]) {
    builder[method] = vi.fn(chain);
  }
  builder['single'] = vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null }));
  builder['maybeSingle'] = vi.fn(() => Promise.resolve({ data: null, error: null }));
  builder['then'] = (resolve: (v: { data: unknown[]; error: null }) => unknown): unknown =>
    Promise.resolve({ data: rows, error: null }).then(resolve);
  return { client: builder } as unknown as SupabaseService;
}

const mockSpaces = {
  getBySlug: vi.fn(() => Promise.resolve({ id: 's1', slug: 'general' })),
} as unknown as SpacesService;

const mockBus = { emit: vi.fn() } as unknown as ClientProxy;

function makePosts(count: number): Post[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    created_at: `2026-06-0${(i % 9) + 1}T00:00:00Z`,
  })) as Post[];
}

describe('PostsService cursor pagination', () => {
  it('returns nextCursor when a full page is returned', async () => {
    const rows = makePosts(20);
    const service = new PostsService(mockSupabase(rows), mockSpaces, mockBus);
    const result = await service.listBySpace('general', user, undefined, 20);
    expect(result.items).toHaveLength(20);
    expect(result.nextCursor).toBe(rows[19]!.created_at);
  });

  it('returns null nextCursor on a partial page', async () => {
    const service = new PostsService(mockSupabase(makePosts(5)), mockSpaces, mockBus);
    const result = await service.listBySpace('general', user, undefined, 20);
    expect(result.items).toHaveLength(5);
    expect(result.nextCursor).toBeNull();
  });
});

describe('PostsService events', () => {
  it('emits post.created after creating a post', async () => {
    const post = { id: 'p1', created_at: 'now' };
    const service = new PostsService(mockSupabase([post]), mockSpaces, mockBus);
    await service.create('general', user, { body: { type: 'doc' } });
    expect(mockBus.emit).toHaveBeenCalledWith(
      'post.created',
      expect.objectContaining({ postId: 'p1', spaceId: 's1', authorId: 'u1' }),
    );
  });
});
