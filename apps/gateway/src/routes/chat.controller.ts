import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, DmMessage, DmThread, PaginatedResult } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { CHAT_SERVICE } from '../clients';
import { CreateDmThreadDto, PaginationQueryDto, SendDmDto } from '../dtos';

@ApiTags('dms')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('dms')
export class ChatController {
  constructor(@Inject(CHAT_SERVICE) private readonly chat: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List DM threads with latest message' })
  listThreads(@CurrentUser() user: AuthenticatedUser): Promise<DmThread[]> {
    return firstValueFrom(this.chat.send(MessagePatterns.DM_THREADS_LIST, { user }));
  }

  @Post()
  @ApiOperation({ summary: 'Create or get existing thread with a user' })
  createThread(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateDmThreadDto,
  ): Promise<DmThread> {
    return firstValueFrom(
      this.chat.send(MessagePatterns.DM_THREAD_CREATE, { user, recipientId: request.recipientId }),
    );
  }

  @Get(':threadId/messages')
  @ApiOperation({ summary: 'Paginated message history' })
  listMessages(
    @Param('threadId') threadId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<DmMessage>> {
    return firstValueFrom(
      this.chat.send(MessagePatterns.DM_MESSAGES_LIST, {
        threadId,
        user,
        cursor: query.cursor,
        limit: query.limit,
      }),
    );
  }

  @Post(':threadId/messages')
  @ApiOperation({ summary: 'Send a DM' })
  send(
    @Param('threadId') threadId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: SendDmDto,
  ): Promise<DmMessage> {
    return firstValueFrom(
      this.chat.send(MessagePatterns.DM_MESSAGE_SEND, { threadId, user, body: request.body }),
    );
  }
}
