import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { ServiceType, BookingType, ServiceFeedResult } from './service.type.js';
import { CreateServiceInput } from './dto/create-service.input.js';
import { UpdateServiceInput } from './dto/update-service.input.js';
import { CreateBookingInput } from './dto/create-booking.input.js';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

interface JwtUser {
  id: string;
  email: string;
  role: string;
}

@Resolver(() => ServiceType)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  // ─── Queries ────────────────────────────────────────────────────────────────

  @Query(() => ServiceFeedResult)
  async services(
    @Args('category', { nullable: true }) category?: string,
    @Args('city', { nullable: true }) city?: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ): Promise<ServiceFeedResult> {
    return this.servicesService.findAll({ category, city }, cursor, limit ?? 12);
  }

  @Query(() => ServiceType)
  async service(@Args('id') id: string): Promise<ServiceType> {
    return this.servicesService.findById(id);
  }

  @Query(() => [ServiceType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('VENDOR')
  async myServices(@CurrentUser() currentUser: JwtUser): Promise<ServiceType[]> {
    return this.servicesService.findByVendor(currentUser.id);
  }

  @Query(() => [BookingType])
  @UseGuards(GqlAuthGuard)
  async myBookings(@CurrentUser() currentUser: JwtUser): Promise<BookingType[]> {
    return this.servicesService.getBookingsForCustomer(currentUser.id);
  }

  @Query(() => [BookingType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('VENDOR')
  async vendorBookings(@CurrentUser() currentUser: JwtUser): Promise<BookingType[]> {
    return this.servicesService.getBookingsForVendor(currentUser.id);
  }

  // ─── Mutations ──────────────────────────────────────────────────────────────

  @Mutation(() => ServiceType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('VENDOR')
  async createService(
    @CurrentUser() currentUser: JwtUser,
    @Args('input') input: CreateServiceInput,
  ): Promise<ServiceType> {
    return this.servicesService.create(currentUser.id, input);
  }

  @Mutation(() => ServiceType)
  @UseGuards(GqlAuthGuard)
  async updateService(
    @CurrentUser() currentUser: JwtUser,
    @Args('input') input: UpdateServiceInput,
  ): Promise<ServiceType> {
    return this.servicesService.update(input.id, currentUser.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteService(
    @CurrentUser() currentUser: JwtUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.servicesService.delete(id, currentUser.id);
  }

  @Mutation(() => ServiceType)
  @UseGuards(GqlAuthGuard)
  async toggleAvailability(
    @CurrentUser() currentUser: JwtUser,
    @Args('id') id: string,
  ): Promise<ServiceType> {
    return this.servicesService.toggleAvailability(id, currentUser.id);
  }

  @Mutation(() => BookingType)
  @UseGuards(GqlAuthGuard)
  async createBooking(
    @CurrentUser() currentUser: JwtUser,
    @Args('input') input: CreateBookingInput,
  ): Promise<BookingType> {
    return this.servicesService.createBooking(currentUser.id, input);
  }

  @Mutation(() => BookingType)
  @UseGuards(GqlAuthGuard)
  async updateBookingStatus(
    @CurrentUser() currentUser: JwtUser,
    @Args('bookingId') bookingId: string,
    @Args('status') status: string,
  ): Promise<BookingType> {
    const validStatus = status as 'CONFIRMED' | 'CANCELLED';
    return this.servicesService.updateBookingStatus(bookingId, currentUser.id, validStatus);
  }
}
