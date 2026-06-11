'use client';

import { useMemo, useState } from 'react';
import { useRsvp, useSpaceEvents, useSpaces } from '@/lib/api/queries';

export default function EventsPage() {
  const { data: spaces } = useSpaces();
  const eventSpaces = useMemo(
    () => spaces?.filter((s) => s.type === 'events') ?? [],
    [spaces],
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const activeSlug = selectedSlug ?? eventSpaces[0]?.slug ?? null;

  const { data: events, isLoading } = useSpaceEvents(activeSlug);
  const rsvp = useRsvp(activeSlug);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Upcoming Events</h1>
        {eventSpaces.length > 1 && (
          <select
            className="input max-w-48"
            value={activeSlug ?? ''}
            onChange={(e) => setSelectedSlug(e.target.value)}
          >
            {eventSpaces.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!activeSlug && (
        <p className="text-sm text-foreground/50">
          No event spaces yet — the owner can create a space of type “events”.
        </p>
      )}

      {isLoading && <div className="card h-24 animate-pulse" />}

      <div className="space-y-3">
        {events?.map((event) => {
          const isFull =
            event.rsvp_limit != null && event.rsvp_count >= event.rsvp_limit && !event.user_has_rsvped;
          return (
            <div key={event.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{event.title}</h2>
                  <p className="mt-1 text-sm text-foreground/60">
                    🗓 {new Date(event.starts_at).toLocaleString()}
                    {event.ends_at && ` — ${new Date(event.ends_at).toLocaleTimeString()}`}
                  </p>
                  {event.description && (
                    <p className="mt-2 text-sm text-foreground/80">{event.description}</p>
                  )}
                  {event.location_url && (
                    <a
                      href={event.location_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-accent underline"
                    >
                      Join link
                    </a>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm text-foreground/60">
                    {event.rsvp_count}
                    {event.rsvp_limit != null && ` / ${event.rsvp_limit}`} going
                  </div>
                  <button
                    className={`mt-2 ${event.user_has_rsvped ? 'input hover:bg-muted' : 'btn-accent'}`}
                    disabled={rsvp.isPending || isFull}
                    onClick={() =>
                      rsvp.mutate({ eventId: event.id, cancel: event.user_has_rsvped })
                    }
                  >
                    {isFull ? 'Full' : event.user_has_rsvped ? 'Cancel RSVP' : 'RSVP'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {events?.length === 0 && (
          <p className="py-8 text-center text-sm text-foreground/50">No upcoming events.</p>
        )}
      </div>
    </div>
  );
}
