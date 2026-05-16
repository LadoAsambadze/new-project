import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterInput } from './dto/register.input.js';
import { Role, VendorType } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  vendorType?: string | null;
}

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface FacebookUser {
  facebookId: string;
  email: string;
  name: string;
  avatar?: string;
}

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const REFRESH_TOKEN_MAX_AGE_MS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterInput) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role as Role | undefined,
      vendorType: dto.vendorType as VendorType | undefined,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? undefined,
        role: user.role,
        vendorType: user.vendorType ?? undefined,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? undefined,
        role: user.role as string,
        vendorType: user.vendorType ?? undefined,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    return user;
  }

  async googleLogin(googleUser: GoogleUser) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      const existingByEmail = await this.usersService.findByEmail(
        googleUser.email,
      );
      if (existingByEmail) {
        // Link google account to existing user by updating via prisma directly
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: googleUser.googleId },
        });
      } else {
        user = await this.usersService.create({
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
          googleId: googleUser.googleId,
          role: Role.CUSTOMER,
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? undefined,
        role: user.role as string,
        vendorType: user.vendorType ?? undefined,
      },
    };
  }

  async facebookLogin(fbUser: FacebookUser) {
    let user = await this.usersService.findByFacebookId(fbUser.facebookId);

    if (!user) {
      const existingByEmail = await this.usersService.findByEmail(fbUser.email);
      if (existingByEmail) {
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { facebookId: fbUser.facebookId },
        });
      } else {
        user = await this.usersService.create({
          email: fbUser.email,
          name: fbUser.name,
          avatar: fbUser.avatar,
          facebookId: fbUser.facebookId,
          role: Role.CUSTOMER,
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? undefined,
        role: user.role as string,
        vendorType: user.vendorType ?? undefined,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string, res: Response) {
    // Find stored refresh tokens for this user
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
    });

    // Verify one of the stored tokens matches
    let validToken: (typeof storedTokens)[0] | null = null;
    for (const stored of storedTokens) {
      const matches = await bcrypt.compare(refreshToken, stored.token);
      if (matches) {
        validToken = stored;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Delete old refresh token (rotation)
    await this.prisma.refreshToken.delete({ where: { id: validToken.id } });

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Set new refresh token cookie
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return tokens.accessToken;
  }

  async logout(userId: string, res: Response) {
    // Delete all refresh tokens for this user
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    this.clearRefreshTokenCookie(res);
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
      },
    });
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
    });
  }
}
