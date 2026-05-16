import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateDesignInput {
  @Field()
  id!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  isForSale?: boolean;
}
