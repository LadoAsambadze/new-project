import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServiceInput } from './dto/create-service.input.js';
import { UpdateServiceInput } from './dto/update-service.input.js';
import { CreateBookingInput } from './dto/create-booking.input.js';
import { ServiceType, BookingType } from './service.type.js';
import { UserType } from '../users/user.type.js';
import { VendorType } from '@prisma/client';

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

type DbBooking = {
  id: string;
  serviceId: string;
  service: DbService;
  userId: string;
  user: DbUser;
  status: string;
  date: Date;
  message: string | null;
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

function toBookingType(b: DbBooking): BookingType {
  const bt = new BookingType();
  bt.id = b.id;
  bt.serviceId = b.serviceId;
  bt.service = toServiceType(b.service);
  bt.userId = b.userId;
  bt.user = toUserType(b.user);
  bt.status = b.status;
  bt.date = b.date.toISOString();
  bt.message = b.message ?? undefined;
  bt.createdAt = b.createdAt.toISOString();
  return bt;
}

const SERVICE_INCLUDE = {
  user: true,
} as const;

const BOOKING_INCLUDE = {
  service: { include: { user: true } },
  user: true,
} as const;

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateServiceInput): Promise<ServiceType> {
    const categoryValue = dto.category.toUpperCase() as VendorType;
    const service = await this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: categoryValue,
        images: dto.images,
        priceFrom: dto.priceFrom,
        priceTo: dto.priceTo,
        city: dto.city,
        userId,
      },
      include: SERVICE_INCLUDE,
    });
    return toServiceType(service as unknown as DbService);
  }

  async findAll(
    filters?: {
      category?: string;
      city?: string;
      isAvailable?: boolean;
      isFeatured?: boolean;
    },
    cursor?: string,
    limit = 12,
  ): Promise<{ items: ServiceType[]; nextCursor?: string; hasMore: boolean }> {
    const take = limit + 1;
    const where: Record<string, unknown> = {};

    if (filters?.category) where.category = filters.category.toUpperCase();
    if (filters?.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters?.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
    if (filters?.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

    const services = await this.prisma.service.findMany({
      where,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: SERVICE_INCLUDE,
    });

    const hasMore = services.length > limit;
    const items = hasMore ? services.slice(0, limit) : services;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return {
      items: items.map((s) => toServiceType(s as unknown as DbService)),
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string): Promise<ServiceType> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: SERVICE_INCLUDE,
    });
    if (!service) throw new NotFoundException('Service not found');
    return toServiceType(service as unknown as DbService);
  }

  async findByVendor(userId: string): Promise<ServiceType[]> {
    const services = await this.prisma.service.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: SERVICE_INCLUDE,
    });
    return services.map((s) => toServiceType(s as unknown as DbService));
  }

  async update(id: string, userId: string, dto: UpdateServiceInput): Promise<ServiceType> {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not the owner');

    const service = await this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && {
          category: dto.category.toUpperCase() as VendorType,
        }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.priceFrom !== undefined && { priceFrom: dto.priceFrom }),
        ...(dto.priceTo !== undefined && { priceTo: dto.priceTo }),
        ...(dto.city !== undefined && { city: dto.city }),
      },
      include: SERVICE_INCLUDE,
    });
    return toServiceType(service as unknown as DbService);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not the owner');

    await this.prisma.service.delete({ where: { id } });
    return true;
  }

  async toggleAvailability(id: string, userId: string): Promise<ServiceType> {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not the owner');

    const service = await this.prisma.service.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
      include: SERVICE_INCLUDE,
    });
    return toServiceType(service as unknown as DbService);
  }

  async createBooking(customerId: string, dto: CreateBookingInput): Promise<BookingType> {
    const svc = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
    if (!svc) throw new NotFoundException('Service not found');
    if (svc.userId === customerId)
      throw new BadRequestException('Cannot book your own service');

    const booking = await this.prisma.booking.create({
      data: {
        serviceId: dto.serviceId,
        userId: customerId,
        date: new Date(dto.date),
        message: dto.message,
      },
      include: BOOKING_INCLUDE,
    });
    return toBookingType(booking as unknown as DbBooking);
  }

  async updateBookingStatus(
    bookingId: string,
    vendorUserId: string,
    status: 'CONFIRMED' | 'CANCELLED',
  ): Promise<BookingType> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.service.userId !== vendorUserId)
      throw new ForbiddenException('Not the service owner');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: BOOKING_INCLUDE,
    });
    return toBookingType(updated as unknown as DbBooking);
  }

  async getBookingsForVendor(userId: string): Promise<BookingType[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { service: { userId } },
      orderBy: { createdAt: 'desc' },
      include: BOOKING_INCLUDE,
    });
    return bookings.map((b) => toBookingType(b as unknown as DbBooking));
  }

  async getBookingsForCustomer(userId: string): Promise<BookingType[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: BOOKING_INCLUDE,
    });
    return bookings.map((b) => toBookingType(b as unknown as DbBooking));
  }
}
