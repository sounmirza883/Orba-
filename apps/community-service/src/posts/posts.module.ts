import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SpacesModule } from '../spaces/spaces.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

export const EVENT_BUS = 'EVENT_BUS';

@Module({
  imports: [
    SpacesModule,
    ClientsModule.register([
      {
        name: EVENT_BUS,
        transport: Transport.NATS,
        options: { servers: [process.env.NATS_URL ?? 'nats://localhost:4222'] },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
