import { Module } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AdminResolver } from './admin.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [AdminService, AdminResolver],
})
export class AdminModule {}
