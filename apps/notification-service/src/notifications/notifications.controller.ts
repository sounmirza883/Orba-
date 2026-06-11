import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@nexushub/shared-types';
import type {
  AppNotification,
  CommentCreatedEvent,
  SubscriptionActivatedEvent,
} from '@nexushub/shared-types';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  // ----- Gateway request/reply -----

  @MessagePattern(MessagePatterns.NOTIFICATIONS_LIST)
  list(@Payload() data: { userId: string; unreadOnly?: boolean }): Promise<AppNotification[]> {
    return this.notifications.list(data.userId, data.unreadOnly);
  }

  @MessagePattern(MessagePatterns.NOTIFICATIONS_MARK_READ)
  async markRead(
    @Payload() data: { notificationId: string; userId: string },
  ): Promise<{ ok: boolean }> {
    await this.notifications.markRead(data.notificationId, data.userId);
    return { ok: true };
  }

  @MessagePattern(MessagePatterns.NOTIFICATIONS_PREFS_GET)
  getPrefs(@Payload() data: { userId: string }): Promise<{
    email_replies: boolean;
    email_mentions: boolean;
    email_new_posts: boolean;
    weekly_digest: boolean;
  }> {
    return this.notifications.getFullPreferences(data.userId);
  }

  @MessagePattern(MessagePatterns.NOTIFICATIONS_PREFS_UPDATE)
  async updatePrefs(
    @Payload()
    data: {
      userId: string;
      prefs: {
        emailReplies?: boolean;
        emailMentions?: boolean;
        emailNewPosts?: boolean;
        weeklyDigest?: boolean;
      };
    },
  ): Promise<{ ok: boolean }> {
    await this.notifications.updatePreferences(data.userId, data.prefs);
    return { ok: true };
  }

  // ----- NATS event subscriptions (PRD §9) -----

  @EventPattern('comment.created')
  async onCommentCreated(@Payload() event: CommentCreatedEvent): Promise<void> {
    if (event.postAuthorId) {
      await this.notifications.notifyReply(event.postAuthorId, event.authorId, event.commentId);
    }
    if (event.mentionedIds.length > 0) {
      await this.notifications.notifyMentions(event.mentionedIds, event.authorId, event.commentId);
    }
  }

  @EventPattern('subscription.activated')
  async onSubscriptionActivated(@Payload() event: SubscriptionActivatedEvent): Promise<void> {
    // In-app receipt notification; email receipt comes from Stripe itself
    await this.notifications.create({
      userId: event.userId,
      type: 'new_post',
      actorId: event.userId,
      targetId: event.tierId,
      targetType: 'subscription',
    });
  }
}
