import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationType } from './notification.type.js';
import { PUB_SUB } from './pubsub.provider.js';
import { PubSub } from 'graphql-subscriptions';

function toNotificationType(n: {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
}): NotificationType {
  const nt = new NotificationType();
  nt.id = n.id;
  nt.userId = n.userId;
  nt.title = n.title;
  nt.body = n.body;
  nt.read = n.read;
  nt.link = n.link ?? undefined;
  nt.createdAt = n.createdAt.toISOString();
  return nt;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async create(
    userId: string,
    title: string,
    body: string,
    link?: string,
  ): Promise<NotificationType> {
    const notification = await this.prisma.notification.create({
      data: { userId, title, body, link },
    });
    const nt = toNotificationType(notification);
    await this.pubSub.publish('notificationReceived', {
      notificationReceived: nt,
      userId,
    });
    return nt;
  }

  async findByUser(userId: string, onlyUnread = false): Promise<NotificationType[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId, ...(onlyUnread ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return notifications.map(toNotificationType);
  }

  async markRead(id: string, userId: string): Promise<NotificationType> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    if (notification.userId !== userId) {
      throw new Error('Forbidden');
    }
    return toNotificationType(notification);
  }

  async markAllRead(userId: string): Promise<boolean> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return true;
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.prisma.notification.deleteMany({
      where: { id, userId },
    });
    return true;
  }
}
