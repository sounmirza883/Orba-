import { Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AppNotification, AuthenticatedUser } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { NOTIFICATION_SERVICE } from '../clients';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(@Inject(NOTIFICATION_SERVICE) private readonly notifications: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'In-app notification center' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('unreadOnly') unreadOnly?: string,
  ): Promise<AppNotification[]> {
    return firstValueFrom(
      this.notifications.send(MessagePatterns.NOTIFICATIONS_LIST, {
        userId: user.id,
        unreadOnly: unreadOnly === 'true',
      }),
    );
  }

  @Post(':notificationId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ ok: boolean }> {
    return firstValueFrom(
      this.notifications.send(MessagePatterns.NOTIFICATIONS_MARK_READ, {
        notificationId,
        userId: user.id,
      }),
    );
  }
}
