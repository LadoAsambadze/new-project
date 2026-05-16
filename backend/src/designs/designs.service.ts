import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDesignInput } from './dto/create-design.input.js';
import { UpdateDesignInput } from './dto/update-design.input.js';
import { DesignType } from './design.type.js';
import { UserType } from '../users/user.type.js';

type PrismaUser = {
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

type PrismaDesign = {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  category: string;
  price: number | null;
  isForSale: boolean;
  userId: string;
  createdAt: Date;
  user: PrismaUser;
  likes: { userId: string }[];
  savedBy: { userId: string }[];
};

function toUserType(u: PrismaUser): UserType {
  const userType = new UserType();
  userType.id = u.id;
  userType.email = u.email;
  userType.name = u.name;
  userType.avatar = u.avatar ?? undefined;
  userType.role = u.role;
  userType.vendorType = u.vendorType ?? undefined;
  userType.bio = u.bio ?? undefined;
  userType.city = u.city ?? undefined;
  userType.createdAt = u.createdAt.toISOString();
  return userType;
}

function toDesignType(d: PrismaDesign, currentUserId?: string | null): DesignType {
  const designType = new DesignType();
  designType.id = d.id;
  designType.title = d.title;
  designType.description = d.description ?? undefined;
  designType.images = d.images;
  designType.category = d.category;
  designType.price = d.price ?? undefined;
  designType.isForSale = d.isForSale;
  designType.userId = d.userId;
  designType.user = toUserType(d.user);
  designType.likesCount = d.likes.length;
  designType.likedByMe = currentUserId
    ? d.likes.some((l) => l.userId === currentUserId)
    : false;
  designType.savedByMe = currentUserId
    ? d.savedBy.some((s) => s.userId === currentUserId)
    : false;
  designType.createdAt = d.createdAt.toISOString();
  return designType;
}

const DESIGN_INCLUDE = {
  user: true,
  likes: { select: { userId: true } },
  savedBy: { select: { userId: true } },
} as const;

@Injectable()
export class DesignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDesignInput): Promise<DesignType> {
    const design = await this.prisma.design.create({
      data: {
        title: dto.title,
        description: dto.description,
        images: dto.images,
        category: dto.category,
        price: dto.price,
        isForSale: dto.isForSale,
        userId,
      },
      include: DESIGN_INCLUDE,
    });
    return toDesignType(design as PrismaDesign, userId);
  }

  async findAll(
    filters?: { category?: string; userId?: string; isForSale?: boolean },
    cursor?: string,
    limit = 12,
    currentUserId?: string | null,
  ): Promise<{ items: DesignType[]; nextCursor?: string; hasMore: boolean }> {
    const take = limit + 1;
    const where: Record<string, unknown> = {};

    if (filters?.category) where.category = filters.category;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.isForSale !== undefined) where.isForSale = filters.isForSale;

    const designs = await this.prisma.design.findMany({
      where,
      take,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: { createdAt: 'desc' },
      include: DESIGN_INCLUDE,
    });

    const hasMore = designs.length > limit;
    const items = hasMore ? designs.slice(0, limit) : designs;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return {
      items: items.map((d) => toDesignType(d as PrismaDesign, currentUserId)),
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string, currentUserId?: string | null): Promise<DesignType> {
    const design = await this.prisma.design.findUnique({
      where: { id },
      include: DESIGN_INCLUDE,
    });
    if (!design) throw new NotFoundException('Design not found');
    return toDesignType(design as PrismaDesign, currentUserId);
  }

  async findByUser(userId: string, currentUserId?: string | null): Promise<DesignType[]> {
    const designs = await this.prisma.design.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: DESIGN_INCLUDE,
    });
    return designs.map((d) => toDesignType(d as PrismaDesign, currentUserId));
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDesignInput,
  ): Promise<DesignType> {
    const existing = await this.prisma.design.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Design not found');
    if (existing.userId !== userId)
      throw new ForbiddenException('Not the owner');

    const design = await this.prisma.design.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.isForSale !== undefined && { isForSale: dto.isForSale }),
      },
      include: DESIGN_INCLUDE,
    });
    return toDesignType(design as PrismaDesign, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.design.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Design not found');
    if (existing.userId !== userId)
      throw new ForbiddenException('Not the owner');

    await this.prisma.design.delete({ where: { id } });
    return true;
  }

  async toggleLike(designId: string, userId: string): Promise<DesignType> {
    const existing = await this.prisma.designLike.findUnique({
      where: { userId_designId: { userId, designId } },
    });

    if (existing) {
      await this.prisma.designLike.delete({
        where: { userId_designId: { userId, designId } },
      });
    } else {
      await this.prisma.designLike.create({
        data: { userId, designId },
      });
    }

    return this.findById(designId, userId);
  }

  async toggleSave(designId: string, userId: string): Promise<DesignType> {
    const existing = await this.prisma.savedDesign.findUnique({
      where: { userId_designId: { userId, designId } },
    });

    if (existing) {
      await this.prisma.savedDesign.delete({
        where: { userId_designId: { userId, designId } },
      });
    } else {
      await this.prisma.savedDesign.create({
        data: { userId, designId },
      });
    }

    return this.findById(designId, userId);
  }
}
