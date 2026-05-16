import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from '../users/user.type.js';

@ObjectType()
export class ServiceType {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  category!: string;

  @Field(() => [String])
  images!: string[];

  @Field()
  priceFrom!: number;

  @Field({ nullable: true })
  priceTo?: number;

  @Field()
  city!: string;

  @Field()
  isAvailable!: boolean;

  @Field()
  isFeatured!: boolean;

  @Field()
  userId!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field(() => String)
  createdAt!: string;
}

@ObjectType()
export class BookingType {
  @Field()
  id!: string;

  @Field()
  serviceId!: string;

  @Field(() => ServiceType)
  service!: ServiceType;

  @Field()
  userId!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field()
  status!: string;

  @Field(() => String)
  date!: string;

  @Field({ nullable: true })
  message?: string;

  @Field(() => String)
  createdAt!: string;
}

@ObjectType()
export class ServiceFeedResult {
  @Field(() => [ServiceType])
  items!: ServiceType[];

  @Field({ nullable: true })
  nextCursor?: string;

  @Field()
  hasMore!: boolean;
}
