import { Module } from '@nestjs/common';
import { SupabaseModule } from '@nexushub/nest-common';
import { HealthController } from './health.controller';
import { SpacesModule } from './spaces/spaces.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [SupabaseModule, SpacesModule, PostsModule],
  controllers: [HealthController],
})
export class AppModule {}
