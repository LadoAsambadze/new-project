import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service.js';
import { MessagingResolver } from './messaging.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, UsersModule, NotificationsModule],
  providers: [MessagingService, MessagingResolver],
  exports: [MessagingService],
})
export class MessagingModule {}
