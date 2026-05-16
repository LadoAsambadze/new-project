import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role, VendorType } from '@prisma/client';

export interface CreateUserDto {
  email: string;
  password?: string;
  name: string;
  role?: Role;
  vendorType?: VendorType;
  googleId?: string;
  facebookId?: string;
  avatar?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  findByFacebookId(facebookId: string) {
    return this.prisma.user.findUnique({ where: { facebookId } });
  }

  create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
        name: dto.name,
        role: dto.role ?? Role.CUSTOMER,
        vendorType: dto.vendorType,
        googleId: dto.googleId,
        facebookId: dto.facebookId,
        avatar: dto.avatar,
      },
    });
  }
}
