import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDesignInput {
  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  images!: string[];

  @Field()
  category!: string;

  @Field({ nullable: true })
  price?: number;

  @Field()
  isForSale!: boolean;
}
