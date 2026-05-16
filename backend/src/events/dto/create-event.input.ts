import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateEventInput {
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
  ticketPrice!: number;

  @Field()
  totalTickets!: number;
}
