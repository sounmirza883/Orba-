import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BillingController } from './billing.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { BillingService } from './billing.service';

export const EVENT_BUS = 'EVENT_BUS';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EVENT_BUS,
        transport: Transport.NATS,
        options: { servers: [process.env.NATS_URL ?? 'nats://localhost:4222'] },
      },
    ]),
  ],
  controllers: [BillingController, StripeWebhookController],
  providers: [BillingService],
})
export class BillingModule {}
