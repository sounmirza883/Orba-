import { ClientsModule, Transport } from '@nestjs/microservices';
import type { DynamicModule } from '@nestjs/common';

export const AUTH_SERVICE = 'AUTH_SERVICE';
export const COMMUNITY_SERVICE = 'COMMUNITY_SERVICE';
export const CHAT_SERVICE = 'CHAT_SERVICE';
export const MEMBERSHIP_SERVICE = 'MEMBERSHIP_SERVICE';
export const MEDIA_SERVICE = 'MEDIA_SERVICE';
export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';

const natsOptions = {
  transport: Transport.NATS as const,
  options: { servers: [process.env.NATS_URL ?? 'nats://localhost:4222'] },
};

export function registerServiceClients(): DynamicModule {
  return ClientsModule.register([
    { name: AUTH_SERVICE, ...natsOptions },
    { name: COMMUNITY_SERVICE, ...natsOptions },
    { name: CHAT_SERVICE, ...natsOptions },
    { name: MEMBERSHIP_SERVICE, ...natsOptions },
    { name: MEDIA_SERVICE, ...natsOptions },
    { name: NOTIFICATION_SERVICE, ...natsOptions },
  ]);
}
