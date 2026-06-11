import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, OwnerGuard, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, EventWithRsvps } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { COMMUNITY_SERVICE } from '../clients';
import { CreateEventDto } from '../dtos';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('events')
export class EventsController {
  constructor(@Inject(COMMUNITY_SERVICE) private readonly community: ClientProxy) {}

  @Get(':spaceSlug')
  @ApiOperation({ summary: 'Upcoming events in a space with RSVP state' })
  list(
    @Param('spaceSlug') spaceSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventWithRsvps[]> {
    return firstValueFrom(this.community.send(MessagePatterns.EVENTS_LIST, { spaceSlug, user }));
  }

  @Post(':spaceSlug')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Create event (owner only)' })
  create(
    @Param('spaceSlug') spaceSlug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateEventDto,
  ): Promise<{ id: string }> {
    return firstValueFrom(
      this.community.send(MessagePatterns.EVENTS_CREATE, { spaceSlug, user, request }),
    );
  }

  @Post(':eventId/rsvp')
  @ApiOperation({ summary: 'RSVP to an event' })
  rsvp(
    @Param('eventId') eventId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ ok: boolean }> {
    return firstValueFrom(
      this.community.send(MessagePatterns.EVENTS_RSVP, { eventId, userId: user.id }),
    );
  }

  @Delete(':eventId/rsvp')
  @ApiOperation({ summary: 'Cancel RSVP' })
  cancelRsvp(
    @Param('eventId') eventId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ ok: boolean }> {
    return firstValueFrom(
      this.community.send(MessagePatterns.EVENTS_RSVP_CANCEL, { eventId, userId: user.id }),
    );
  }
}
