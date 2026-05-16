import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from '../users/user.type.js';

@ObjectType()
export class EventType {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => [String])
  images!: string[];

  @Field()
  city!: string;

  @Field()
  address!: string;

  @Field(() => String)
  date!: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field()
  category!: string;

  @Field()
  status!: string;

  @Field()
  isFeatured!: boolean;

  @Field()
  ticketPrice!: number;

  @Field()
  totalTickets!: number;

  @Field()
  soldTickets!: number;

  @Field()
  availableTickets!: number;

  @Field()
  userId!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field(() => String)
  createdAt!: string;
}

@ObjectType()
export class TicketType {
  @Field()
  id!: string;

  @Field()
  eventId!: string;

  @Field(() => EventType)
  event!: EventType;

  @Field()
  userId!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field()
  price!: number;

  @Field()
  qrCode!: string;

  @Field()
  used!: boolean;

  @Field(() => String)
  createdAt!: string;
}

@ObjectType()
export class EventFeedResult {
  @Field(() => [EventType])
  items!: EventType[];

  @Field({ nullable: true })
  nextCursor?: string;

  @Field()
  hasMore!: boolean;
}
