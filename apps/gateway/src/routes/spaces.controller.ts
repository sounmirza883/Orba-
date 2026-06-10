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
import { CurrentUser, OwnerGuard, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, PaginatedResult, Post as PostEntity, Space } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { COMMUNITY_SERVICE } from '../clients';
import { CreatePostDto, CreateSpaceDto, PaginationQueryDto, UpdateSpaceDto } from '../dtos';

@ApiTags('spaces')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('spaces')
export class SpacesController {
  constructor(@Inject(COMMUNITY_SERVICE) private readonly community: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List all spaces user has access to' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<Space[]> {
    return firstValueFrom(this.community.send(MessagePatterns.SPACES_LIST, { user }));
  }

  @Post()
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Create space (owner only)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateSpaceDto,
  ): Promise<Space> {
    return firstValueFrom(this.community.send(MessagePatterns.SPACES_CREATE, { user, request }));
  }

  @Patch(':spaceId')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Update space (owner only)' })
  update(@Param('spaceId') spaceId: string, @Body() patch: UpdateSpaceDto): Promise<Space> {
    return firstValueFrom(this.community.send(MessagePatterns.SPACES_UPDATE, { spaceId, patch }));
  }

  @Delete(':spaceId')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete space (owner only)' })
  remove(@Param('spaceId') spaceId: string): Promise<{ ok: boolean }> {
    return firstValueFrom(this.community.send(MessagePatterns.SPACES_DELETE, { spaceId }));
  }

  @Get(':slug/posts')
  @ApiOperation({ summary: 'Paginated post feed (cursor-based)' })
  listPosts(
    @Param('slug') spaceSlug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<PostEntity>> {
    return firstValueFrom(
      this.community.send(MessagePatterns.POSTS_LIST, {
        spaceSlug,
        user,
        cursor: query.cursor,
        limit: query.limit,
      }),
    );
  }

  @Post(':slug/posts')
  @ApiOperation({ summary: 'Create post in a space' })
  createPost(
    @Param('slug') spaceSlug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreatePostDto,
  ): Promise<PostEntity> {
    return firstValueFrom(
      this.community.send(MessagePatterns.POSTS_CREATE, { spaceSlug, user, request }),
    );
  }
}
