import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UserType } from './user.type.js';
import { UpdateProfileInput } from './dto/update-profile.input.js';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { VendorType } from '@prisma/client';

interface JwtUser {
  id: string;
  email: string;
  role: string;
  vendorType?: string | null;
}

function toUserType(user: {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
  vendorType?: string | null;
  bio?: string | null;
  city?: string | null;
  createdAt: Date;
}): UserType {
  const u = new UserType();
  u.id = user.id;
  u.email = user.email;
  u.name = user.name;
  u.avatar = user.avatar ?? undefined;
  u.role = user.role;
  u.vendorType = user.vendorType ?? undefined;
  u.bio = user.bio ?? undefined;
  u.city = user.city ?? undefined;
  u.createdAt = user.createdAt.toISOString();
  return u;
}

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserType)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: JwtUser): Promise<UserType> {
    const dbUser = await this.usersService.findById(user.id);
    if (!dbUser) throw new NotFoundException('User not found');
    return toUserType(dbUser);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() user: JwtUser,
    @Args('input') input: UpdateProfileInput,
  ): Promise<UserType> {
    const updated = await this.usersService.update(user.id, {
      name: input.name,
      bio: input.bio,
      city: input.city,
      avatar: input.avatar,
    });
    return toUserType(updated);
  }

  @Query(() => UserType)
  async userProfile(@Args('id') id: string): Promise<UserType> {
    const dbUser = await this.usersService.findById(id);
    if (!dbUser) throw new NotFoundException('User not found');
    return toUserType(dbUser);
  }

  @Query(() => [UserType])
  async vendors(
    @Args('type', { nullable: true }) type?: string,
  ): Promise<UserType[]> {
    const users = await this.usersService.findVendors(type);
    return users.map(toUserType);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async completeVendorOnboarding(
    @CurrentUser() user: JwtUser,
    @Args('vendorType') vendorType: string,
  ): Promise<UserType> {
    if (user.role !== 'VENDOR') {
      throw new ForbiddenException('Only vendors can complete vendor onboarding');
    }
    const updated = await this.usersService.update(user.id, {
      vendorType: vendorType as VendorType,
    });
    return toUserType(updated);
  }
}
