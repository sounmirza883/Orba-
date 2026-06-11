import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SupabaseModule } from '@nexushub/nest-common';
import { registerServiceClients } from './clients';
import { HealthController } from './routes/health.controller';
import { ProfilesController } from './routes/profiles.controller';
import { SpacesController } from './routes/spaces.controller';
import { PostsController } from './routes/posts.controller';
import { ChatController } from './routes/chat.controller';
import { BillingController } from './routes/billing.controller';
import { UploadsController } from './routes/uploads.controller';
import { NotificationsController } from './routes/notifications.controller';
import { CoursesController } from './routes/courses.controller';
import { EventsController } from './routes/events.controller';

@Module({
  imports: [
    // 100 req/min default (PRD §14); tighter limits set per-route with @Throttle
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    SupabaseModule,
    registerServiceClients(),
  ],
  controllers: [
    HealthController,
    ProfilesController,
    SpacesController,
    PostsController,
    ChatController,
    BillingController,
    UploadsController,
    NotificationsController,
    CoursesController,
    EventsController,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
