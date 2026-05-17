import { Module } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { ServicesResolver } from './services.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, UsersModule, NotificationsModule],
  providers: [ServicesService, ServicesResolver],
  exports: [ServicesService],
})
export class ServicesModule {}
