import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AdminService } from './admin.service.js';
import { AdminStats } from './admin-stats.type.js';
import { UserType } from '../users/user.type.js';
import { ServiceType } from '../services/service.type.js';
import { EventType } from '../events/event.type.js';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => AdminStats)
  async adminStats(): Promise<AdminStats> {
    return this.adminService.getStats();
  }

  @Query(() => [UserType])
  async adminUsers(
    @Args('cursor', { nullable: true }) cursor?: string,
  ): Promise<UserType[]> {
    return this.adminService.getAllUsers(cursor);
  }

  @Query(() => [UserType])
  async adminVendors(): Promise<UserType[]> {
    return this.adminService.getAllVendors();
  }

  @Query(() => [ServiceType])
  async adminServices(
    @Args('cursor', { nullable: true }) cursor?: string,
  ): Promise<ServiceType[]> {
    return this.adminService.getAllServices(cursor);
  }

  @Query(() => [EventType])
  async adminEvents(
    @Args('cursor', { nullable: true }) cursor?: string,
  ): Promise<EventType[]> {
    return this.adminService.getAllEvents(cursor);
  }

  @Mutation(() => UserType)
  async banUser(@Args('id') id: string): Promise<UserType> {
    return this.adminService.banUser(id);
  }

  @Mutation(() => UserType)
  async unbanUser(@Args('id') id: string): Promise<UserType> {
    return this.adminService.unbanUser(id);
  }

  @Mutation(() => Boolean)
  async setFeatured(
    @Args('type') type: string,
    @Args('id') id: string,
    @Args('featured') featured: boolean,
  ): Promise<boolean> {
    return this.adminService.setFeatured(type, id, featured);
  }

  @Mutation(() => Boolean)
  async adminDeleteDesign(@Args('id') id: string): Promise<boolean> {
    return this.adminService.deleteDesign(id);
  }

  @Mutation(() => Boolean)
  async adminDeleteService(@Args('id') id: string): Promise<boolean> {
    return this.adminService.deleteService(id);
  }

  @Mutation(() => Boolean)
  async adminDeleteEvent(@Args('id') id: string): Promise<boolean> {
    return this.adminService.deleteEvent(id);
  }
}
