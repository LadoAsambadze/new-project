import { Module } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { EventsResolver } from './events.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [EventsService, EventsResolver],
  exports: [EventsService],
})
export class EventsModule {}
