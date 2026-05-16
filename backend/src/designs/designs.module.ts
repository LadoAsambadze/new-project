import { Module } from '@nestjs/common';
import { DesignsService } from './designs.service.js';
import { DesignsResolver } from './designs.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [DesignsService, DesignsResolver],
  exports: [DesignsService],
})
export class DesignsModule {}
