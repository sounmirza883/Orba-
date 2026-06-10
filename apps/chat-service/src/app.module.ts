import { Module } from '@nestjs/common';
import { SupabaseModule } from '@nexushub/nest-common';
import { HealthController } from './health.controller';
import { DmsModule } from './dms/dms.module';

@Module({
  imports: [SupabaseModule, DmsModule],
  controllers: [HealthController],
})
export class AppModule {}
