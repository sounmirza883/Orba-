import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '@nexushub/nest-common';
import type { AppNotification, NotificationType } from '@nexushub/shared-types';
import { EmailService } from './email.service';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  actorId: string;
  targetId: string;
  targetType: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
  ) {}

  async list(userId: string, unreadOnly = false): Promise<AppNotification[]> {
    let query = this.supabase.client
      .from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(id, display_name, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as AppNotification[];
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }

  async create(input: CreateNotificationInput): Promise<void> {
    if (input.userId === input.actorId) return; // don't notify yourself

    const { error } = await this.supabase.client.from('notifications').insert({
      user_id: input.userId,
      type: input.type,
      actor_id: input.actorId,
      target_id: input.targetId,
      target_type: input.targetType,
    });
    if (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      return;
    }

    // Realtime badge update via Broadcast channel notifications:{userId} (PRD §11)
    const channel = this.supabase.client.channel(`notifications:${input.userId}`);
    await channel.send({ type: 'broadcast', event: 'new-notification', payload: { type: input.type } });
    await this.supabase.client.removeChannel(channel);
  }

  async notifyReply(postAuthorId: string, actorId: string, commentId: string): Promise<void> {
    await this.create({
      userId: postAuthorId,
      type: 'reply',
      actorId,
      targetId: commentId,
      targetType: 'comment',
    });

    const pref = await this.getPreferences(postAuthorId);
    if (!pref.email_replies) return;

    const [recipient, actor] = await Promise.all([
      this.getEmailAndName(postAuthorId),
      this.getEmailAndName(actorId),
    ]);
    if (!recipient?.email) return;

    await this.email.send(
      recipient.email,
      `${actor?.name ?? 'Someone'} replied to your post`,
      this.email.replyTemplate(actor?.name ?? 'Someone', '', process.env.BASE_URL ?? ''),
    );
  }

  async notifyMentions(mentionedIds: string[], actorId: string, commentId: string): Promise<void> {
    for (const userId of mentionedIds) {
      await this.create({
        userId,
        type: 'mention',
        actorId,
        targetId: commentId,
        targetType: 'comment',
      });

      const pref = await this.getPreferences(userId);
      if (!pref.email_mentions) continue;

      const [recipient, actor] = await Promise.all([
        this.getEmailAndName(userId),
        this.getEmailAndName(actorId),
      ]);
      if (!recipient?.email) continue;

      await this.email.send(
        recipient.email,
        `${actor?.name ?? 'Someone'} mentioned you`,
        this.email.mentionTemplate(actor?.name ?? 'Someone', process.env.BASE_URL ?? ''),
      );
    }
  }

  private async getPreferences(
    userId: string,
  ): Promise<{ email_replies: boolean; email_mentions: boolean }> {
    const { data } = await this.supabase.client
      .from('notification_preferences')
      .select('email_replies, email_mentions')
      .eq('user_id', userId)
      .maybeSingle();
    return data ?? { email_replies: true, email_mentions: true };
  }

  private async getEmailAndName(userId: string): Promise<{ email: string | null; name: string } | null> {
    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle();

    const { data: authUser } = await this.supabase.client.auth.admin.getUserById(userId);
    return {
      email: authUser?.user?.email ?? null,
      name: profile?.display_name ?? 'A member',
    };
  }
}
