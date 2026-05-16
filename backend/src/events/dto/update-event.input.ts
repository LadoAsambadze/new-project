import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateEventInput {
  @Field()
  id!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  date?: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  ticketPrice?: number;

  @Field({ nullable: true })
  totalTickets?: number;
}
