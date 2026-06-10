import { Module } from '@nestjs/common';
import { SupabaseModule } from '@nexushub/nest-common';
import { HealthController } from './health.controller';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [SupabaseModule, ProfilesModule],
  controllers: [HealthController],
})
export class AppModule {}
