import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

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
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
