import { Module } from '@nestjs/common';
import { SpacesModule } from '../spaces/spaces.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [SpacesModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
