import { Module } from '@nestjs/common';
import { SupabaseModule } from '@nexushub/nest-common';
import { HealthController } from './health.controller';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [SupabaseModule, BillingModule],
  controllers: [HealthController],
})
export class AppModule {}
