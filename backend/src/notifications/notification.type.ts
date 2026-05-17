import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class NotificationType {
  @Field()
  id!: string;

  @Field()
  userId!: string;

  @Field()
  title!: string;

  @Field()
  body!: string;

  @Field()
  read!: boolean;

  @Field({ nullable: true })
  link?: string;

  @Field(() => String)
  createdAt!: string;
}
