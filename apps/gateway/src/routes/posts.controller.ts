import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, Comment, Post as PostEntity } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { COMMUNITY_SERVICE } from '../clients';
import { CreateCommentDto, ToggleReactionDto, UpdatePostDto } from '../dtos';

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(@Inject(COMMUNITY_SERVICE) private readonly community: ClientProxy) {}

  @Get('search')
  @ApiOperation({ summary: 'Full-text search (Postgres tsvector)' })
  search(@Query('q') query: string, @Query('limit') limit?: number): Promise<PostEntity[]> {
    return firstValueFrom(this.community.send(MessagePatterns.POSTS_SEARCH, { query, limit }));
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Get a single post' })
  get(@Param('postId') postId: string): Promise<PostEntity> {
    return firstValueFrom(this.community.send(MessagePatterns.POSTS_GET, { postId }));
  }

  @Patch(':postId')
  @ApiOperation({ summary: 'Update post (author or owner; pin/hide owner only)' })
  update(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() patch: UpdatePostDto,
  ): Promise<PostEntity> {
    return firstValueFrom(this.community.send(MessagePatterns.POSTS_UPDATE, { postId, user, patch }));
  }

  @Delete(':postId')
  @ApiOperation({ summary: 'Delete post (author or owner)' })
  remove(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ ok: boolean }> {
    return firstValueFrom(this.community.send(MessagePatterns.POSTS_DELETE, { postId, user }));
  }

  @Get(':postId/comments')
  @ApiOperation({ summary: 'List threaded comments on a post' })
  listComments(@Param('postId') postId: string): Promise<Comment[]> {
    return firstValueFrom(this.community.send(MessagePatterns.COMMENTS_LIST, { postId }));
  }

  @Post(':postId/comments')
  @ApiOperation({ summary: 'Add comment to a post' })
  createComment(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateCommentDto,
  ): Promise<Comment> {
    return firstValueFrom(
      this.community.send(MessagePatterns.COMMENTS_CREATE, { postId, user, request }),
    );
  }

  @Post(':targetId/reactions')
  @ApiOperation({ summary: 'Toggle emoji reaction on post or comment' })
  toggleReaction(
    @Param('targetId') targetId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: ToggleReactionDto,
  ): Promise<{ reacted: boolean }> {
    return firstValueFrom(
      this.community.send(MessagePatterns.REACTIONS_TOGGLE, { targetId, user, request }),
    );
  }
}
