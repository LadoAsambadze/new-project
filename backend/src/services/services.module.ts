import { Module } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { ServicesResolver } from './services.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [ServicesService, ServicesResolver],
  exports: [ServicesService],
})
export class ServicesModule {}
