import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateServiceInput {
  @Field()
  id!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  priceFrom?: number;

  @Field({ nullable: true })
  priceTo?: number;

  @Field({ nullable: true })
  city?: string;
}
