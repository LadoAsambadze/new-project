import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBookingInput {
  @Field()
  serviceId!: string;

  @Field(() => String)
  date!: string;

  @Field({ nullable: true })
  message?: string;
}
