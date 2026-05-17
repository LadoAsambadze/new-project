import { Resolver, Query, Mutation, Subscription, Args, Context } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationType } from './notification.type.js';
import { PUB_SUB } from './pubsub.provider.js';
import { PubSub } from 'graphql-subscriptions';

interface JwtUser {
  id: string;
  email: string;
}

@Resolver(() => NotificationType)
export class NotificationsResolver {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => [NotificationType])
  @UseGuards(GqlAuthGuard)
  async myNotifications(
    @CurrentUser() user: JwtUser,
    @Args('onlyUnread', { nullable: true }) onlyUnread?: boolean,
  ): Promise<NotificationType[]> {
    return this.notificationsService.findByUser(user.id, onlyUnread ?? false);
  }

  @Query(() => Number)
  @UseGuards(GqlAuthGuard)
  async unreadCount(@CurrentUser() user: JwtUser): Promise<number> {
    return this.notificationsService.unreadCount(user.id);
  }

  @Mutation(() => NotificationType)
  @UseGuards(GqlAuthGuard)
  async markRead(
    @CurrentUser() user: JwtUser,
    @Args('id') id: string,
  ): Promise<NotificationType> {
    return this.notificationsService.markRead(id, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markAllRead(@CurrentUser() user: JwtUser): Promise<boolean> {
    return this.notificationsService.markAllRead(user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteNotification(
    @CurrentUser() user: JwtUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.notificationsService.delete(id, user.id);
  }

  @Subscription(() => NotificationType, {
    filter(
      payload: { notificationReceived: NotificationType; userId: string },
      _variables: unknown,
      context: { extra?: { user?: JwtUser }; req?: { user?: JwtUser } },
    ) {
      const user = context?.extra?.user ?? context?.req?.user;
      if (!user) return false;
      return payload.userId === user.id;
    },
  })
  notificationReceived(@Context() _ctx: unknown) {
    return this.pubSub.asyncIterableIterator('notificationReceived');
  }
}
