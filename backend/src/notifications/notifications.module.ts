import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { NotificationsResolver } from './notifications.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { pubSubProvider } from './pubsub.provider.js';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService, NotificationsResolver, pubSubProvider],
  exports: [NotificationsService, pubSubProvider],
})
export class NotificationsModule {}
