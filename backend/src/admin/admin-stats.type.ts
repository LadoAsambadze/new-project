import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AdminStats {
  @Field(() => Int)
  totalUsers!: number;

  @Field(() => Int)
  totalVendors!: number;

  @Field(() => Int)
  totalCustomers!: number;

  @Field(() => Int)
  totalDesigns!: number;

  @Field(() => Int)
  totalEvents!: number;

  @Field(() => Int)
  totalBookings!: number;

  @Field(() => Int)
  totalTickets!: number;
}
