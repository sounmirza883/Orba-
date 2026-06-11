import { Body, Controller, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AppNotification, AuthenticatedUser } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { NOTIFICATION_SERVICE } from '../clients';
import { UpdateNotificationPrefsDto } from '../dtos';

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

  @Get('preferences')
  @ApiOperation({ summary: 'My notification preferences' })
  getPrefs(@CurrentUser() user: AuthenticatedUser): Promise<Record<string, boolean>> {
    return firstValueFrom(
      this.notifications.send(MessagePatterns.NOTIFICATIONS_PREFS_GET, { userId: user.id }),
    );
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update my notification preferences' })
  updatePrefs(
    @CurrentUser() user: AuthenticatedUser,
    @Body() prefs: UpdateNotificationPrefsDto,
  ): Promise<{ ok: boolean }> {
    return firstValueFrom(
      this.notifications.send(MessagePatterns.NOTIFICATIONS_PREFS_UPDATE, {
        userId: user.id,
        prefs,
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
