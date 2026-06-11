import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '@nexushub/nest-common';
import type {
  AuthenticatedUser,
  CreateEventRequest,
  EventWithRsvps,
} from '@nexushub/shared-types';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly spaces: SpacesService,
  ) {}

  /** Upcoming events for a space, with RSVP count and the caller's RSVP state. */
  async list(spaceSlug: string, user: AuthenticatedUser): Promise<EventWithRsvps[]> {
    const space = await this.spaces.getBySlug(spaceSlug, user);

    const { data, error } = await this.supabase.client
      .from('events')
      .select('*, rsvps:event_rsvps(user_id)')
      .eq('space_id', space.id)
      .gte('starts_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      .order('starts_at');
    if (error) throw new Error(error.message);

    return (data ?? []).map((event) => {
      const rsvps = (event.rsvps ?? []) as { user_id: string }[];
      const { rsvps: _drop, ...rest } = event;
      return {
        ...rest,
        rsvp_count: rsvps.length,
        user_has_rsvped: rsvps.some((r) => r.user_id === user.id),
      } as EventWithRsvps;
    });
  }

  async create(
    spaceSlug: string,
    user: AuthenticatedUser,
    request: CreateEventRequest,
  ): Promise<{ id: string }> {
    const space = await this.spaces.getBySlug(spaceSlug, user);

    const { data, error } = await this.supabase.client
      .from('events')
      .insert({
        space_id: space.id,
        title: request.title,
        description: request.description,
        starts_at: request.startsAt,
        ends_at: request.endsAt,
        location_url: request.locationUrl,
        rsvp_limit: request.rsvpLimit,
        created_by: user.id,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create event');
    return data;
  }

  async rsvp(eventId: string, userId: string): Promise<{ ok: boolean }> {
    const { data: event } = await this.supabase.client
      .from('events')
      .select('id, rsvp_limit, rsvps:event_rsvps(user_id)')
      .eq('id', eventId)
      .maybeSingle();
    if (!event) throw new NotFoundException('Event not found');

    const rsvps = (event.rsvps ?? []) as { user_id: string }[];
    if (event.rsvp_limit != null && rsvps.length >= event.rsvp_limit) {
      throw new BadRequestException('Event is full');
    }

    const { error } = await this.supabase.client
      .from('event_rsvps')
      .upsert({ event_id: eventId, user_id: userId }, { onConflict: 'event_id,user_id' });
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  async cancelRsvp(eventId: string, userId: string): Promise<{ ok: boolean }> {
    const { error } = await this.supabase.client
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  }
}
