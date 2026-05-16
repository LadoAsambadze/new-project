import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventInput } from './dto/create-event.input.js';
import { UpdateEventInput } from './dto/update-event.input.js';
import { EventType, TicketType } from './event.type.js';
import { UserType } from '../users/user.type.js';

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

type DbEvent = {
  id: string;
  title: string;
  description: string;
  images: string[];
  city: string;
  address: string;
  date: Date;
  endDate: Date | null;
  category: string;
  status: string;
  isFeatured: boolean;
  ticketPrice: number;
  totalTickets: number;
  userId: string;
  user: DbUser;
  createdAt: Date;
  _count?: { tickets: number };
};

type DbTicket = {
  id: string;
  eventId: string;
  event: DbEvent;
  userId: string;
  user: DbUser;
  price: number;
  qrCode: string;
  used: boolean;
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

function toEventType(e: DbEvent): EventType {
  const et = new EventType();
  et.id = e.id;
  et.title = e.title;
  et.description = e.description;
  et.images = e.images;
  et.city = e.city;
  et.address = e.address;
  et.date = e.date.toISOString();
  et.endDate = e.endDate ? e.endDate.toISOString() : undefined;
  et.category = e.category;
  et.status = e.status;
  et.isFeatured = e.isFeatured;
  et.ticketPrice = e.ticketPrice;
  et.totalTickets = e.totalTickets;
  et.soldTickets = e._count?.tickets ?? 0;
  et.availableTickets = e.totalTickets - (e._count?.tickets ?? 0);
  et.userId = e.userId;
  et.user = toUserType(e.user);
  et.createdAt = e.createdAt.toISOString();
  return et;
}

function toTicketType(t: DbTicket): TicketType {
  const tt = new TicketType();
  tt.id = t.id;
  tt.eventId = t.eventId;
  tt.event = toEventType(t.event);
  tt.userId = t.userId;
  tt.user = toUserType(t.user);
  tt.price = t.price;
  tt.qrCode = t.qrCode;
  tt.used = t.used;
  tt.createdAt = t.createdAt.toISOString();
  return tt;
}

const EVENT_INCLUDE = {
  user: true,
  _count: { select: { tickets: true } },
} as const;

const TICKET_INCLUDE = {
  event: {
    include: {
      user: true,
      _count: { select: { tickets: true } },
    },
  },
  user: true,
} as const;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventInput): Promise<EventType> {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        images: dto.images,
        city: dto.city,
        address: dto.address,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        category: dto.category,
        status: 'DRAFT',
        ticketPrice: dto.ticketPrice,
        totalTickets: dto.totalTickets,
        userId,
      },
      include: EVENT_INCLUDE,
    });
    return toEventType(event as unknown as DbEvent);
  }

  async publish(id: string, userId: string): Promise<EventType> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not the owner');

    const event = await this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: EVENT_INCLUDE,
    });
    return toEventType(event as unknown as DbEvent);
  }

  async findAll(
    filters?: { city?: string; category?: string; status?: string; dateFrom?: string },
    cursor?: string,
    limit = 12,
  ): Promise<{ items: EventType[]; nextCursor?: string; hasMore: boolean }> {
    const take = limit + 1;
    const where: Record<string, unknown> = { status: 'PUBLISHED' };

    if (filters?.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters?.category) where.category = { contains: filters.category, mode: 'insensitive' };
    if (filters?.status) where.status = filters.status;
    if (filters?.dateFrom) where.date = { gte: new Date(filters.dateFrom) };

    const events = await this.prisma.event.findMany({
      where,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { date: 'asc' },
      include: EVENT_INCLUDE,
    });

    const hasMore = events.length > limit;
    const items = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return {
      items: items.map((e) => toEventType(e as unknown as DbEvent)),
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string, _currentUserId?: string): Promise<EventType> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_INCLUDE,
    });
    if (!event) throw new NotFoundException('Event not found');
    return toEventType(event as unknown as DbEvent);
  }

  async findByOrganizer(userId: string): Promise<EventType[]> {
    const events = await this.prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: EVENT_INCLUDE,
    });
    return events.map((e) => toEventType(e as unknown as DbEvent));
  }

  async update(id: string, userId: string, dto: UpdateEventInput): Promise<EventType> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not the owner');
    if (existing.status !== 'DRAFT') throw new ForbiddenException('Only DRAFT events can be edited');

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.ticketPrice !== undefined && { ticketPrice: dto.ticketPrice }),
        ...(dto.totalTickets !== undefined && { totalTickets: dto.totalTickets }),
      },
      include: EVENT_INCLUDE,
    });
    return toEventType(event as unknown as DbEvent);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not the owner');

    await this.prisma.event.delete({ where: { id } });
    return true;
  }

  async purchaseTicket(eventId: string, userId: string): Promise<TicketType> {
    const rawEvent = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { tickets: true } } },
    });
    if (!rawEvent) throw new NotFoundException('Event not found');
    const event = rawEvent as unknown as {
      id: string;
      status: string;
      userId: string;
      ticketPrice: number;
      totalTickets: number;
      _count: { tickets: number };
    };
    if (event.status !== 'PUBLISHED') throw new BadRequestException('Event is not published');
    if (event.userId === userId) throw new BadRequestException('Cannot buy ticket to your own event');

    const soldTickets = event._count.tickets;
    if (soldTickets >= event.totalTickets) throw new BadRequestException('Event is sold out');

    const existing = await this.prisma.ticket.findFirst({
      where: { eventId, userId },
    });
    if (existing) throw new BadRequestException('You already have a ticket for this event');

    const ticket = await this.prisma.ticket.create({
      data: {
        eventId,
        userId,
        price: event.ticketPrice,
        qrCode: crypto.randomUUID(),
      },
      include: TICKET_INCLUDE,
    });
    return toTicketType(ticket as unknown as DbTicket);
  }

  async getMyTickets(userId: string): Promise<TicketType[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: TICKET_INCLUDE,
    });
    return tickets.map((t) => toTicketType(t as unknown as DbTicket));
  }

  async validateTicket(qrCode: string, organizerUserId: string): Promise<TicketType> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: TICKET_INCLUDE,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.event.userId !== organizerUserId)
      throw new ForbiddenException('Not the event organizer');
    if (ticket.used) throw new BadRequestException('Ticket already used');

    const updated = await this.prisma.ticket.update({
      where: { qrCode },
      data: { used: true },
      include: TICKET_INCLUDE,
    });
    return toTicketType(updated as unknown as DbTicket);
  }

  async getEventAttendees(eventId: string, userId: string): Promise<TicketType[]> {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('Not the event organizer');

    const tickets = await this.prisma.ticket.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: TICKET_INCLUDE,
    });
    return tickets.map((t) => toTicketType(t as unknown as DbTicket));
  }

  // ─── Discovery Methods ────────────────────────────────────────────────────────

  async findFeatured(limit = 6): Promise<EventType[]> {
    const events = await this.prisma.event.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      orderBy: { date: 'asc' },
      take: limit,
      include: EVENT_INCLUDE,
    });
    return events.map((e) => toEventType(e as unknown as DbEvent));
  }

  async findByCity(
    city: string,
    filters?: { category?: string; dateFrom?: string },
    cursor?: string,
    limit = 12,
  ): Promise<{ items: EventType[]; nextCursor?: string; hasMore: boolean }> {
    const take = limit + 1;
    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
      city: { contains: city, mode: 'insensitive' },
    };
    if (filters?.category) where.category = { contains: filters.category, mode: 'insensitive' };
    if (filters?.dateFrom) where.date = { gte: new Date(filters.dateFrom) };

    const events = await this.prisma.event.findMany({
      where,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { date: 'asc' },
      include: EVENT_INCLUDE,
    });

    const hasMore = events.length > limit;
    const items = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return {
      items: items.map((e) => toEventType(e as unknown as DbEvent)),
      nextCursor,
      hasMore,
    };
  }

  async getCities(): Promise<string[]> {
    const groups = await this.prisma.event.groupBy({
      by: ['city'],
      where: { status: 'PUBLISHED' },
      orderBy: { city: 'asc' },
    });
    return groups.map((g) => g.city);
  }

  async findUpcoming(limit = 8): Promise<EventType[]> {
    const events = await this.prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: limit,
      include: EVENT_INCLUDE,
    });
    return events.map((e) => toEventType(e as unknown as DbEvent));
  }
}
