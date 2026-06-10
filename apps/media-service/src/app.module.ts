import { Module } from '@nestjs/common';
import { SupabaseModule } from '@nexushub/nest-common';
import { HealthController } from './health.controller';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [SupabaseModule, UploadsModule],
  controllers: [HealthController],
})
export class AppModule {}
