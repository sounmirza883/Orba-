import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@nexushub/shared-types';
import type {
  AuthenticatedUser,
  DmMessage,
  DmThread,
  PaginatedResult,
} from '@nexushub/shared-types';
import { DmsService } from './dms.service';

@Controller()
export class DmsController {
  constructor(private readonly dms: DmsService) {}

  @MessagePattern(MessagePatterns.DM_THREADS_LIST)
  listThreads(@Payload() data: { user: AuthenticatedUser }): Promise<DmThread[]> {
    return this.dms.listThreads(data.user);
  }

  @MessagePattern(MessagePatterns.DM_THREAD_CREATE)
  createThread(
    @Payload() data: { user: AuthenticatedUser; recipientId: string },
  ): Promise<DmThread> {
    return this.dms.createOrGetThread(data.user, data.recipientId);
  }

  @MessagePattern(MessagePatterns.DM_MESSAGES_LIST)
  listMessages(
    @Payload()
    data: { threadId: string; user: AuthenticatedUser; cursor?: string; limit?: number },
  ): Promise<PaginatedResult<DmMessage>> {
    return this.dms.listMessages(data.threadId, data.user, data.cursor, data.limit);
  }

  @MessagePattern(MessagePatterns.DM_MESSAGE_SEND)
  send(
    @Payload() data: { threadId: string; user: AuthenticatedUser; body: string },
  ): Promise<DmMessage> {
    return this.dms.sendMessage(data.threadId, data.user, data.body);
  }
}
