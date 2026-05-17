import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { MessageType, ConversationType } from './message.type.js';
import { UserType } from '../users/user.type.js';
import { PUB_SUB } from '../notifications/pubsub.provider.js';
import { PubSub } from 'graphql-subscriptions';

type DbUser = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  vendorType: string | null;
  bio: string | null;
  city: string | null;
  createdAt: Date;
};

type DbMessage = {
  id: string;
  fromUserId: string;
  fromUser: DbUser;
  toUserId: string;
  toUser: DbUser;
  body: string;
  read: boolean;
  createdAt: Date;
};

function toUserType(u: DbUser): UserType {
  const ut = new UserType();
  ut.id = u.id;
  ut.email = u.email;
  ut.name = u.name;
  ut.avatar = u.avatar ?? undefined;
  ut.role = u.role;
  ut.vendorType = u.vendorType ?? undefined;
  ut.bio = u.bio ?? undefined;
  ut.city = u.city ?? undefined;
  ut.createdAt = u.createdAt.toISOString();
  return ut;
}

function toMessageType(m: DbMessage): MessageType {
  const mt = new MessageType();
  mt.id = m.id;
  mt.fromUserId = m.fromUserId;
  mt.fromUser = toUserType(m.fromUser);
  mt.toUserId = m.toUserId;
  mt.toUser = toUserType(m.toUser);
  mt.body = m.body;
  mt.read = m.read;
  mt.createdAt = m.createdAt.toISOString();
  return mt;
}

const MESSAGE_INCLUDE = {
  fromUser: true,
  toUser: true,
} as const;

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async sendMessage(
    fromUserId: string,
    toUserId: string,
    body: string,
  ): Promise<MessageType> {
    const message = await this.prisma.message.create({
      data: { fromUserId, toUserId, body },
      include: MESSAGE_INCLUDE,
    });
    const mt = toMessageType(message as unknown as DbMessage);

    const sender = message.fromUser as unknown as DbUser;
    await this.notificationsService.create(
      toUserId,
      `New message from ${sender.name}`,
      body.slice(0, 100),
      `/messages?with=${fromUserId}`,
    );

    await this.pubSub.publish('messageReceived', {
      messageReceived: mt,
      toUserId,
    });

    return mt;
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    cursor?: string,
    limit = 30,
  ): Promise<MessageType[]> {
    const take = limit + 1;
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: userId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: userId },
        ],
      },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: MESSAGE_INCLUDE,
    });

    const items = messages.length > limit ? messages.slice(0, limit) : messages;
    return items.map((m) => toMessageType(m as unknown as DbMessage));
  }

  async getConversations(userId: string): Promise<ConversationType[]> {
    // Get all unique users this user has exchanged messages with
    const sentTo = await this.prisma.message.groupBy({
      by: ['toUserId'],
      where: { fromUserId: userId },
    });
    const receivedFrom = await this.prisma.message.groupBy({
      by: ['fromUserId'],
      where: { toUserId: userId },
    });

    const otherUserIds = [
      ...new Set([
        ...sentTo.map((m) => m.toUserId),
        ...receivedFrom.map((m) => m.fromUserId),
      ]),
    ];

    const conversations: ConversationType[] = [];

    for (const otherUserId of otherUserIds) {
      const lastMessage = await this.prisma.message.findFirst({
        where: {
          OR: [
            { fromUserId: userId, toUserId: otherUserId },
            { fromUserId: otherUserId, toUserId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: MESSAGE_INCLUDE,
      });

      if (!lastMessage) continue;

      const unreadCount = await this.prisma.message.count({
        where: { fromUserId: otherUserId, toUserId: userId, read: false },
      });

      const otherUser =
        lastMessage.fromUserId === userId
          ? (lastMessage.toUser as unknown as DbUser)
          : (lastMessage.fromUser as unknown as DbUser);

      const ct = new ConversationType();
      ct.otherUser = toUserType(otherUser);
      ct.lastMessage = toMessageType(lastMessage as unknown as DbMessage);
      ct.unreadCount = unreadCount;
      conversations.push(ct);
    }

    // Sort by last message date desc
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime(),
    );

    return conversations;
  }

  async markConversationRead(userId: string, otherUserId: string): Promise<boolean> {
    await this.prisma.message.updateMany({
      where: { fromUserId: otherUserId, toUserId: userId, read: false },
      data: { read: true },
    });
    return true;
  }
}
