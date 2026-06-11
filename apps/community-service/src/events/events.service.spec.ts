import { describe, expect, it, vi } from 'vitest';
import { EventsService } from './events.service';
import type { SupabaseService } from '@nexushub/nest-common';
import type { SpacesService } from '../spaces/spaces.service';

function mockSupabase(maybeSingleResult: unknown, upsertError: { message: string } | null = null) {
  const builder: Record<string, unknown> = {};
  const chain = (): Record<string, unknown> => builder;
  for (const method of ['from', 'select', 'eq', 'gte', 'order', 'delete']) {
    builder[method] = vi.fn(chain);
  }
  builder['maybeSingle'] = vi.fn(() => Promise.resolve({ data: maybeSingleResult, error: null }));
  builder['upsert'] = vi.fn(() => Promise.resolve({ error: upsertError }));
  return { client: builder } as unknown as SupabaseService;
}

const spaces = {} as SpacesService;

describe('EventsService RSVP', () => {
  it('rejects RSVP when event is at capacity', async () => {
    const fullEvent = {
      id: 'e1',
      rsvp_limit: 2,
      rsvps: [{ user_id: 'a' }, { user_id: 'b' }],
    };
    const service = new EventsService(mockSupabase(fullEvent), spaces);
    await expect(service.rsvp('e1', 'u1')).rejects.toThrow('Event is full');
  });

  it('accepts RSVP when below capacity', async () => {
    const openEvent = { id: 'e1', rsvp_limit: 10, rsvps: [{ user_id: 'a' }] };
    const service = new EventsService(mockSupabase(openEvent), spaces);
    await expect(service.rsvp('e1', 'u1')).resolves.toEqual({ ok: true });
  });

  it('accepts RSVP when no limit is set', async () => {
    const unlimited = { id: 'e1', rsvp_limit: null, rsvps: [] };
    const service = new EventsService(mockSupabase(unlimited), spaces);
    await expect(service.rsvp('e1', 'u1')).resolves.toEqual({ ok: true });
  });

  it('404s when the event does not exist', async () => {
    const service = new EventsService(mockSupabase(null), spaces);
    await expect(service.rsvp('missing', 'u1')).rejects.toThrow('Event not found');
  });
});
