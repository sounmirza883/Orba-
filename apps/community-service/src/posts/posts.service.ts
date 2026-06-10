import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseService } from '@nexushub/nest-common';
import type {
  AuthenticatedUser,
  Comment,
  CommentCreatedEvent,
  CreateCommentRequest,
  CreatePostRequest,
  PaginatedResult,
  Post,
  PostCreatedEvent,
  ToggleReactionRequest,
} from '@nexushub/shared-types';
import { SpacesService } from '../spaces/spaces.service';

const AUTHOR_SELECT = '*, author:profiles(id, display_name, avatar_url, username)';

@Injectable()
export class PostsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly spaces: SpacesService,
    @Inject('EVENT_BUS') private readonly eventBus: ClientProxy,
  ) {}

  /** Cursor-based pagination (PRD §9): cursor is the created_at of the last item. */
  async listBySpace(
    spaceSlug: string,
    user: AuthenticatedUser,
    cursor?: string,
    limit = 20,
  ): Promise<PaginatedResult<Post>> {
    const space = await this.spaces.getBySlug(spaceSlug, user);

    let query = this.supabase.client
      .from('posts')
      .select(AUTHOR_SELECT)
      .eq('space_id', space.id)
      .eq('is_hidden', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) query = query.lt('created_at', cursor);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const items = (data ?? []) as Post[];
    const last = items.length === limit ? items[items.length - 1] : undefined;
    return { items, nextCursor: last ? last.created_at : null };
  }

  async getById(postId: string): Promise<Post> {
    const { data, error } = await this.supabase.client
      .from('posts')
      .select(AUTHOR_SELECT)
      .eq('id', postId)
      .single();
    if (error || !data) throw new NotFoundException('Post not found');
    return data as Post;
  }

  async create(
    spaceSlug: string,
    user: AuthenticatedUser,
    request: CreatePostRequest,
  ): Promise<Post> {
    const space = await this.spaces.getBySlug(spaceSlug, user);

    const { data, error } = await this.supabase.client
      .from('posts')
      .insert({
        space_id: space.id,
        author_id: user.id,
        title: request.title,
        body: request.body,
      })
      .select(AUTHOR_SELECT)
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create post');

    const post = data as Post;
    const event: PostCreatedEvent = {
      postId: post.id,
      spaceId: space.id,
      authorId: user.id,
      tenantId: user.tenantId ?? '',
    };
    this.eventBus.emit('post.created', event);
    return post;
  }

  async update(
    postId: string,
    user: AuthenticatedUser,
    patch: { title?: string; body?: unknown; isPinned?: boolean; isHidden?: boolean },
  ): Promise<Post> {
    const existing = await this.getById(postId);
    const isAuthor = existing.author_id === user.id;
    if (!isAuthor && !user.isOwner) throw new ForbiddenException('Not your post');

    // pin/hide are owner-only moderation actions
    const moderation = user.isOwner ? { is_pinned: patch.isPinned, is_hidden: patch.isHidden } : {};

    const { data, error } = await this.supabase.client
      .from('posts')
      .update({
        title: patch.title,
        body: patch.body,
        updated_at: new Date().toISOString(),
        ...moderation,
      })
      .eq('id', postId)
      .select(AUTHOR_SELECT)
      .single();
    if (error || !data) throw new NotFoundException('Post not found');
    return data as Post;
  }

  async delete(postId: string, user: AuthenticatedUser): Promise<void> {
    const existing = await this.getById(postId);
    if (existing.author_id !== user.id && !user.isOwner) {
      throw new ForbiddenException('Not your post');
    }
    const { error } = await this.supabase.client.from('posts').delete().eq('id', postId);
    if (error) throw new Error(error.message);
  }

  /** Full-text search via Postgres tsvector index on body_text. */
  async search(query: string, limit = 20): Promise<Post[]> {
    const { data, error } = await this.supabase.client
      .from('posts')
      .select(AUTHOR_SELECT)
      .textSearch('body_text', query, { type: 'websearch', config: 'english' })
      .eq('is_hidden', false)
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as Post[];
  }

  async listComments(postId: string): Promise<Comment[]> {
    const { data, error } = await this.supabase.client
      .from('comments')
      .select(AUTHOR_SELECT)
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Comment[];
  }

  async createComment(
    postId: string,
    user: AuthenticatedUser,
    request: CreateCommentRequest,
  ): Promise<Comment> {
    const post = await this.getById(postId);

    const { data, error } = await this.supabase.client
      .from('comments')
      .insert({
        post_id: postId,
        parent_id: request.parentId,
        author_id: user.id,
        body: request.body,
      })
      .select(AUTHOR_SELECT)
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create comment');

    const comment = data as Comment;
    const event: CommentCreatedEvent = {
      commentId: comment.id,
      postId,
      postAuthorId: post.author_id ?? '',
      authorId: user.id,
      mentionedIds: request.mentionedIds ?? [],
    };
    this.eventBus.emit('comment.created', event);
    return comment;
  }

  /** Toggle: insert reaction if absent, remove if present. Returns new state. */
  async toggleReaction(
    targetId: string,
    user: AuthenticatedUser,
    request: ToggleReactionRequest,
  ): Promise<{ reacted: boolean }> {
    const { data: existing } = await this.supabase.client
      .from('reactions')
      .select('id')
      .eq('target_id', targetId)
      .eq('target_type', request.targetType)
      .eq('user_id', user.id)
      .eq('emoji', request.emoji)
      .maybeSingle();

    if (existing) {
      await this.supabase.client.from('reactions').delete().eq('id', existing.id);
      return { reacted: false };
    }

    const { error } = await this.supabase.client.from('reactions').insert({
      target_id: targetId,
      target_type: request.targetType,
      user_id: user.id,
      emoji: request.emoji,
    });
    if (error) throw new Error(error.message);
    return { reacted: true };
  }
}
