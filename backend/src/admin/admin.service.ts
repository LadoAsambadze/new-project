import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdminStats } from './admin-stats.type.js';
import { UserType } from '../users/user.type.js';
import { ServiceType } from '../services/service.type.js';
import { EventType } from '../events/event.type.js';

type DbUser = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  vendorType: string | null;
  bio: string | null;
  city: string | null;
  banned: boolean;
  createdAt: Date;
};

type DbService = {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  priceFrom: number;
  priceTo: number | null;
  city: string;
  isAvailable: boolean;
  isFeatured: boolean;
  userId: string;
  createdAt: Date;
  user: DbUser;
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
  ut.banned = u.banned;
  ut.createdAt = u.createdAt.toISOString();
  return ut;
}

function toServiceType(s: DbService): ServiceType {
  const st = new ServiceType();
  st.id = s.id;
  st.title = s.title;
  st.description = s.description;
  st.category = s.category;
  st.images = s.images;
  st.priceFrom = s.priceFrom;
  st.priceTo = s.priceTo ?? undefined;
  st.city = s.city;
  st.isAvailable = s.isAvailable;
  st.isFeatured = s.isFeatured;
  st.userId = s.userId;
  st.user = toUserType(s.user);
  st.createdAt = s.createdAt.toISOString();
  return st;
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
  et.endDate = e.endDate?.toISOString();
  et.category = e.category;
  et.status = e.status;
  et.isFeatured = e.isFeatured;
  et.ticketPrice = e.ticketPrice;
  et.totalTickets = e.totalTickets;
  const soldTickets = e._count?.tickets ?? 0;
  et.soldTickets = soldTickets;
  et.availableTickets = Math.max(0, e.totalTickets - soldTickets);
  et.userId = e.userId;
  et.user = toUserType(e.user);
  et.createdAt = e.createdAt.toISOString();
  return et;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<AdminStats> {
    const [
      totalUsers,
      totalVendors,
      totalCustomers,
      totalDesigns,
      totalEvents,
      totalBookings,
      totalTickets,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'VENDOR' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.design.count(),
      this.prisma.event.count(),
      this.prisma.booking.count(),
      this.prisma.ticket.count(),
    ]);

    const stats = new AdminStats();
    stats.totalUsers = totalUsers;
    stats.totalVendors = totalVendors;
    stats.totalCustomers = totalCustomers;
    stats.totalDesigns = totalDesigns;
    stats.totalEvents = totalEvents;
    stats.totalBookings = totalBookings;
    stats.totalTickets = totalTickets;
    return stats;
  }

  async getAllUsers(cursor?: string, limit = 20): Promise<UserType[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => toUserType(u as unknown as DbUser));
  }

  async getAllVendors(): Promise<UserType[]> {
    const vendors = await this.prisma.user.findMany({
      where: { role: 'VENDOR' },
      orderBy: { createdAt: 'desc' },
    });
    return vendors.map((u) => toUserType(u as unknown as DbUser));
  }

  async banUser(id: string): Promise<UserType> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { banned: true },
    });
    return toUserType(user as unknown as DbUser);
  }

  async unbanUser(id: string): Promise<UserType> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { banned: false },
    });
    return toUserType(user as unknown as DbUser);
  }

  async getAllServices(cursor?: string, limit = 20): Promise<ServiceType[]> {
    const services = await this.prisma.service.findMany({
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    return services.map((s) => toServiceType(s as unknown as DbService));
  }

  async getAllEvents(cursor?: string, limit = 20): Promise<EventType[]> {
    const events = await this.prisma.event.findMany({
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { user: true, _count: { select: { tickets: true } } },
    });
    return events.map((e) => toEventType(e as unknown as DbEvent));
  }

  async setFeatured(type: string, id: string, featured: boolean): Promise<boolean> {
    if (type === 'service') {
      const existing = await this.prisma.service.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Service not found');
      await this.prisma.service.update({ where: { id }, data: { isFeatured: featured } });
    } else if (type === 'event') {
      const existing = await this.prisma.event.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Event not found');
      await this.prisma.event.update({ where: { id }, data: { isFeatured: featured } });
    } else {
      throw new NotFoundException(`Unknown type: ${type}`);
    }
    return true;
  }

  async deleteDesign(id: string): Promise<boolean> {
    await this.prisma.design.delete({ where: { id } });
    return true;
  }

  async deleteService(id: string): Promise<boolean> {
    await this.prisma.service.delete({ where: { id } });
    return true;
  }

  async deleteEvent(id: string): Promise<boolean> {
    await this.prisma.event.delete({ where: { id } });
    return true;
  }
}
