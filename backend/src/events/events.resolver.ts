import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { EventType, TicketType, EventFeedResult } from './event.type.js';
import { CreateEventInput } from './dto/create-event.input.js';
import { UpdateEventInput } from './dto/update-event.input.js';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

interface JwtUser {
  id: string;
  email: string;
  role: string;
}

@Resolver(() => EventType)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  // ─── Queries ─────────────────────────────────────────────────────────────────

  @Query(() => EventFeedResult)
  async events(
    @Args('city', { nullable: true }) city?: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ): Promise<EventFeedResult> {
    return this.eventsService.findAll({ city, category, dateFrom }, cursor, limit ?? 12);
  }

  @Query(() => EventType)
  async event(@Args('id') id: string): Promise<EventType> {
    return this.eventsService.findById(id);
  }

  @Query(() => [EventType])
  @UseGuards(GqlAuthGuard)
  async myEvents(@CurrentUser() currentUser: JwtUser): Promise<EventType[]> {
    return this.eventsService.findByOrganizer(currentUser.id);
  }

  @Query(() => [TicketType])
  @UseGuards(GqlAuthGuard)
  async myTickets(@CurrentUser() currentUser: JwtUser): Promise<TicketType[]> {
    return this.eventsService.getMyTickets(currentUser.id);
  }

  @Query(() => [EventType])
  async featuredEvents(
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ): Promise<EventType[]> {
    return this.eventsService.findFeatured(limit ?? 6);
  }

  @Query(() => EventFeedResult)
  async eventsByCity(
    @Args('city') city: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ): Promise<EventFeedResult> {
    return this.eventsService.findByCity(city, { category, dateFrom }, cursor, limit ?? 12);
  }

  @Query(() => [String])
  async availableCities(): Promise<string[]> {
    return this.eventsService.getCities();
  }

  @Query(() => [EventType])
  async upcomingEvents(
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ): Promise<EventType[]> {
    return this.eventsService.findUpcoming(limit ?? 8);
  }

  @Query(() => [TicketType])
  @UseGuards(GqlAuthGuard)
  async eventAttendees(
    @CurrentUser() currentUser: JwtUser,
    @Args('eventId') eventId: string,
  ): Promise<TicketType[]> {
    return this.eventsService.getEventAttendees(eventId, currentUser.id);
  }

  // ─── Mutations ───────────────────────────────────────────────────────────────

  @Mutation(() => EventType)
  @UseGuards(GqlAuthGuard)
  async createEvent(
    @CurrentUser() currentUser: JwtUser,
    @Args('input') input: CreateEventInput,
  ): Promise<EventType> {
    return this.eventsService.create(currentUser.id, input);
  }

  @Mutation(() => EventType)
  @UseGuards(GqlAuthGuard)
  async updateEvent(
    @CurrentUser() currentUser: JwtUser,
    @Args('input') input: UpdateEventInput,
  ): Promise<EventType> {
    return this.eventsService.update(input.id, currentUser.id, input);
  }

  @Mutation(() => EventType)
  @UseGuards(GqlAuthGuard)
  async publishEvent(
    @CurrentUser() currentUser: JwtUser,
    @Args('id') id: string,
  ): Promise<EventType> {
    return this.eventsService.publish(id, currentUser.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteEvent(
    @CurrentUser() currentUser: JwtUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.eventsService.delete(id, currentUser.id);
  }

  @Mutation(() => TicketType)
  @UseGuards(GqlAuthGuard)
  async purchaseTicket(
    @CurrentUser() currentUser: JwtUser,
    @Args('eventId') eventId: string,
  ): Promise<TicketType> {
    return this.eventsService.purchaseTicket(eventId, currentUser.id);
  }

  @Mutation(() => TicketType)
  @UseGuards(GqlAuthGuard)
  async validateTicket(
    @CurrentUser() currentUser: JwtUser,
    @Args('qrCode') qrCode: string,
  ): Promise<TicketType> {
    return this.eventsService.validateTicket(qrCode, currentUser.id);
  }
}
