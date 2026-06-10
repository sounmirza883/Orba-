import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@nexushub/shared-types';
import type {
  AuthenticatedUser,
  Comment,
  CreateCommentRequest,
  CreatePostRequest,
  PaginatedResult,
  Post,
  ToggleReactionRequest,
} from '@nexushub/shared-types';
import { PostsService } from './posts.service';

@Controller()
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @MessagePattern(MessagePatterns.POSTS_LIST)
  list(
    @Payload()
    data: { spaceSlug: string; user: AuthenticatedUser; cursor?: string; limit?: number },
  ): Promise<PaginatedResult<Post>> {
    return this.posts.listBySpace(data.spaceSlug, data.user, data.cursor, data.limit);
  }

  @MessagePattern(MessagePatterns.POSTS_GET)
  get(@Payload() data: { postId: string }): Promise<Post> {
    return this.posts.getById(data.postId);
  }

  @MessagePattern(MessagePatterns.POSTS_CREATE)
  create(
    @Payload()
    data: { spaceSlug: string; user: AuthenticatedUser; request: CreatePostRequest },
  ): Promise<Post> {
    return this.posts.create(data.spaceSlug, data.user, data.request);
  }

  @MessagePattern(MessagePatterns.POSTS_UPDATE)
  update(
    @Payload()
    data: {
      postId: string;
      user: AuthenticatedUser;
      patch: { title?: string; body?: unknown; isPinned?: boolean; isHidden?: boolean };
    },
  ): Promise<Post> {
    return this.posts.update(data.postId, data.user, data.patch);
  }

  @MessagePattern(MessagePatterns.POSTS_DELETE)
  async remove(
    @Payload() data: { postId: string; user: AuthenticatedUser },
  ): Promise<{ ok: boolean }> {
    await this.posts.delete(data.postId, data.user);
    return { ok: true };
  }

  @MessagePattern(MessagePatterns.POSTS_SEARCH)
  search(@Payload() data: { query: string; limit?: number }): Promise<Post[]> {
    return this.posts.search(data.query, data.limit);
  }

  @MessagePattern(MessagePatterns.COMMENTS_LIST)
  listComments(@Payload() data: { postId: string }): Promise<Comment[]> {
    return this.posts.listComments(data.postId);
  }

  @MessagePattern(MessagePatterns.COMMENTS_CREATE)
  createComment(
    @Payload()
    data: { postId: string; user: AuthenticatedUser; request: CreateCommentRequest },
  ): Promise<Comment> {
    return this.posts.createComment(data.postId, data.user, data.request);
  }

  @MessagePattern(MessagePatterns.REACTIONS_TOGGLE)
  toggleReaction(
    @Payload()
    data: { targetId: string; user: AuthenticatedUser; request: ToggleReactionRequest },
  ): Promise<{ reacted: boolean }> {
    return this.posts.toggleReaction(data.targetId, data.user, data.request);
  }
}
