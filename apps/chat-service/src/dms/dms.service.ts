import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '@nexushub/nest-common';
import type {
  AuthenticatedUser,
  DmMessage,
  DmThread,
  PaginatedResult,
} from '@nexushub/shared-types';

/**
 * DM delivery uses Supabase Realtime Broadcast on channel `dm-thread:{threadId}`
 * (PRD §11) — the frontend subscribes directly. This service persists history
 * and enforces participant-only access.
 */
@Injectable()
export class DmsService {
  constructor(private readonly supabase: SupabaseService) {}

  async listThreads(user: AuthenticatedUser): Promise<DmThread[]> {
    const { data: participantRows, error } = await this.supabase.client
      .from('dm_participants')
      .select('thread_id')
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);

    const threadIds = (participantRows ?? []).map((r) => r.thread_id as string);
    if (threadIds.length === 0) return [];

    const { data, error: threadsError } = await this.supabase.client
      .from('dm_threads')
      .select(
        '*, participants:dm_participants(user_id, profile:profiles(id, display_name, avatar_url)), latest:dm_messages(body, sender_id, created_at)',
      )
      .in('id', threadIds)
      .order('created_at', { ascending: false, referencedTable: 'dm_messages' })
      .limit(1, { referencedTable: 'dm_messages' });
    if (threadsError) throw new Error(threadsError.message);
    return (data ?? []) as DmThread[];
  }

  /** Create a thread with a user, or return the existing 1:1 thread. */
  async createOrGetThread(user: AuthenticatedUser, recipientId: string): Promise<DmThread> {
    const { data: myThreads } = await this.supabase.client
      .from('dm_participants')
      .select('thread_id')
      .eq('user_id', user.id);

    const myThreadIds = (myThreads ?? []).map((r) => r.thread_id as string);
    if (myThreadIds.length > 0) {
      const { data: shared } = await this.supabase.client
        .from('dm_participants')
        .select('thread_id')
        .eq('user_id', recipientId)
        .in('thread_id', myThreadIds)
        .limit(1)
        .maybeSingle();

      if (shared) {
        const { data: existing } = await this.supabase.client
          .from('dm_threads')
          .select('*')
          .eq('id', shared.thread_id)
          .single();
        if (existing) return existing as DmThread;
      }
    }

    const { data: thread, error } = await this.supabase.client
      .from('dm_threads')
      .insert({ tenant_id: user.tenantId })
      .select()
      .single();
    if (error || !thread) throw new Error(error?.message ?? 'Failed to create thread');

    await this.supabase.client.from('dm_participants').insert([
      { thread_id: thread.id, user_id: user.id },
      { thread_id: thread.id, user_id: recipientId },
    ]);
    return thread as DmThread;
  }

  async listMessages(
    threadId: string,
    user: AuthenticatedUser,
    cursor?: string,
    limit = 50,
  ): Promise<PaginatedResult<DmMessage>> {
    await this.assertParticipant(threadId, user.id);

    let query = this.supabase.client
      .from('dm_messages')
      .select('*, sender:profiles(id, display_name, avatar_url)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (cursor) query = query.lt('created_at', cursor);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const items = (data ?? []) as DmMessage[];
    const last = items.length === limit ? items[items.length - 1] : undefined;
    return { items, nextCursor: last ? last.created_at : null };
  }

  async sendMessage(threadId: string, user: AuthenticatedUser, body: string): Promise<DmMessage> {
    await this.assertParticipant(threadId, user.id);

    const { data, error } = await this.supabase.client
      .from('dm_messages')
      .insert({ thread_id: threadId, sender_id: user.id, body })
      .select('*, sender:profiles(id, display_name, avatar_url)')
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to send message');

    const message = data as DmMessage;

    // Push to the recipient in realtime via Supabase Broadcast (no extra DB write)
    const channel = this.supabase.client.channel(`dm-thread:${threadId}`);
    await channel.send({ type: 'broadcast', event: 'new-message', payload: message });
    await this.supabase.client.removeChannel(channel);

    return message;
  }

  private async assertParticipant(threadId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('dm_participants')
      .select('user_id')
      .eq('thread_id', threadId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new NotFoundException('Thread not found');
    if (!data) throw new ForbiddenException('Not a participant of this thread');
  }
}
