import { Resolver, Query, Mutation, Subscription, Args, Context } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { MessagingService } from './messaging.service.js';
import { MessageType, ConversationType } from './message.type.js';
import { PUB_SUB } from '../notifications/pubsub.provider.js';
import { PubSub } from 'graphql-subscriptions';

interface JwtUser {
  id: string;
  email: string;
}

@Resolver(() => MessageType)
export class MessagingResolver {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => [ConversationType])
  @UseGuards(GqlAuthGuard)
  async conversations(@CurrentUser() user: JwtUser): Promise<ConversationType[]> {
    return this.messagingService.getConversations(user.id);
  }

  @Query(() => [MessageType])
  @UseGuards(GqlAuthGuard)
  async conversation(
    @CurrentUser() user: JwtUser,
    @Args('otherUserId') otherUserId: string,
    @Args('cursor', { nullable: true }) cursor?: string,
  ): Promise<MessageType[]> {
    return this.messagingService.getConversation(user.id, otherUserId, cursor);
  }

  @Mutation(() => MessageType)
  @UseGuards(GqlAuthGuard)
  async sendMessage(
    @CurrentUser() user: JwtUser,
    @Args('toUserId') toUserId: string,
    @Args('body') body: string,
  ): Promise<MessageType> {
    return this.messagingService.sendMessage(user.id, toUserId, body);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markConversationRead(
    @CurrentUser() user: JwtUser,
    @Args('otherUserId') otherUserId: string,
  ): Promise<boolean> {
    return this.messagingService.markConversationRead(user.id, otherUserId);
  }

  @Subscription(() => MessageType, {
    filter(
      payload: { messageReceived: MessageType; toUserId: string },
      _variables: unknown,
      context: { extra?: { user?: JwtUser }; req?: { user?: JwtUser } },
    ) {
      const user = context?.extra?.user ?? context?.req?.user;
      if (!user) return false;
      return payload.toUserId === user.id;
    },
  })
  messageReceived(@Context() _ctx: unknown) {
    return this.pubSub.asyncIterableIterator('messageReceived');
  }
}
