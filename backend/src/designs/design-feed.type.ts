import { ObjectType, Field } from '@nestjs/graphql';
import { DesignType } from './design.type.js';

@ObjectType()
export class DesignFeedResult {
  @Field(() => [DesignType])
  items!: DesignType[];

  @Field({ nullable: true })
  nextCursor?: string;

  @Field()
  hasMore!: boolean;
}
