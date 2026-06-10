import { Module } from '@nestjs/common';
import { SupabaseModule } from '@nexushub/nest-common';
import { HealthController } from './health.controller';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [SupabaseModule, NotificationsModule],
  controllers: [HealthController],
})
export class AppModule {}
