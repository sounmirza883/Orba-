import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@nexushub/shared-types';
import type {
  AuthenticatedUser,
  CreateEventRequest,
  EventWithRsvps,
} from '@nexushub/shared-types';
import { EventsService } from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @MessagePattern(MessagePatterns.EVENTS_LIST)
  list(
    @Payload() data: { spaceSlug: string; user: AuthenticatedUser },
  ): Promise<EventWithRsvps[]> {
    return this.events.list(data.spaceSlug, data.user);
  }

  @MessagePattern(MessagePatterns.EVENTS_CREATE)
  create(
    @Payload()
    data: { spaceSlug: string; user: AuthenticatedUser; request: CreateEventRequest },
  ): Promise<{ id: string }> {
    return this.events.create(data.spaceSlug, data.user, data.request);
  }

  @MessagePattern(MessagePatterns.EVENTS_RSVP)
  rsvp(@Payload() data: { eventId: string; userId: string }): Promise<{ ok: boolean }> {
    return this.events.rsvp(data.eventId, data.userId);
  }

  @MessagePattern(MessagePatterns.EVENTS_RSVP_CANCEL)
  cancelRsvp(@Payload() data: { eventId: string; userId: string }): Promise<{ ok: boolean }> {
    return this.events.cancelRsvp(data.eventId, data.userId);
  }
}
