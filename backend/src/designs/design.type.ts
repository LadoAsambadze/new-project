import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from '../users/user.type.js';

@ObjectType()
export class DesignType {
  @Field()
  id!: string;

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

  @Field()
  userId!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field()
  likesCount!: number;

  @Field()
  likedByMe!: boolean;

  @Field()
  savedByMe!: boolean;

  @Field(() => String)
  createdAt!: string;
}
