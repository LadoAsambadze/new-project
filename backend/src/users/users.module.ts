import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersResolver } from './users.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
