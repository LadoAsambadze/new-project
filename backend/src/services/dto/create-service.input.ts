import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateServiceInput {
  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => String)
  category!: string;

  @Field(() => [String])
  images!: string[];

  @Field()
  priceFrom!: number;

  @Field({ nullable: true })
  priceTo?: number;

  @Field()
  city!: string;
}
