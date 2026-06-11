import { Module } from '@nestjs/common';
import { SupabaseModule } from '@nexushub/nest-common';
import { HealthController } from './health.controller';
import { SpacesModule } from './spaces/spaces.module';
import { PostsModule } from './posts/posts.module';
import { CoursesModule } from './courses/courses.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [SupabaseModule, SpacesModule, PostsModule, CoursesModule, EventsModule],
  controllers: [HealthController],
})
export class AppModule {}
