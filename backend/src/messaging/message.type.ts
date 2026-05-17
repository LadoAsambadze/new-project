import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from '../users/user.type.js';

@ObjectType()
export class MessageType {
  @Field()
  id!: string;

  @Field()
  fromUserId!: string;

  @Field(() => UserType)
  fromUser!: UserType;

  @Field()
  toUserId!: string;

  @Field(() => UserType)
  toUser!: UserType;

  @Field()
  body!: string;

  @Field()
  read!: boolean;

  @Field(() => String)
  createdAt!: string;
}

@ObjectType()
export class ConversationType {
  @Field(() => UserType)
  otherUser!: UserType;

  @Field(() => MessageType)
  lastMessage!: MessageType;

  @Field()
  unreadCount!: number;
}
