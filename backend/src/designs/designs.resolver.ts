import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DesignsService } from './designs.service.js';
import { DesignType } from './design.type.js';
import { DesignFeedResult } from './design-feed.type.js';
import { CreateDesignInput } from './dto/create-design.input.js';
import { UpdateDesignInput } from './dto/update-design.input.js';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Request } from 'express';

interface JwtUser {
  id: string;
  email: string;
  role: string;
}

interface GqlCtx {
  req: Request & { user?: JwtUser };
}

@Resolver(() => DesignType)
export class DesignsResolver {
  constructor(private readonly designsService: DesignsService) {}

  @Query(() => DesignFeedResult)
  async feed(
    @Context() ctx: GqlCtx,
    @Args('category', { nullable: true }) category?: string,
    @Args('userId', { nullable: true }) userId?: string,
    @Args('isForSale', { nullable: true }) isForSale?: boolean,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ): Promise<DesignFeedResult> {
    const currentUserId = ctx.req.user?.id ?? null;
    const result = await this.designsService.findAll(
      { category, userId, isForSale },
      cursor,
      limit ?? 12,
      currentUserId,
    );
    return result;
  }

  @Query(() => DesignType)
  async design(
    @Context() ctx: GqlCtx,
    @Args('id') id: string,
  ): Promise<DesignType> {
    const currentUserId = ctx.req.user?.id ?? null;
    return this.designsService.findById(id, currentUserId);
  }

  @Query(() => [DesignType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('VENDOR')
  async myDesigns(@CurrentUser() currentUser: JwtUser): Promise<DesignType[]> {
    return this.designsService.findByUser(currentUser.id, currentUser.id);
  }

  @Mutation(() => DesignType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('VENDOR')
  async createDesign(
    @CurrentUser() currentUser: JwtUser,
    @Args('input') input: CreateDesignInput,
  ): Promise<DesignType> {
    return this.designsService.create(currentUser.id, input);
  }

  @Mutation(() => DesignType)
  @UseGuards(GqlAuthGuard)
  async updateDesign(
    @CurrentUser() currentUser: JwtUser,
    @Args('input') input: UpdateDesignInput,
  ): Promise<DesignType> {
    return this.designsService.update(input.id, currentUser.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteDesign(
    @CurrentUser() currentUser: JwtUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.designsService.delete(id, currentUser.id);
  }

  @Mutation(() => DesignType)
  @UseGuards(GqlAuthGuard)
  async toggleLike(
    @CurrentUser() currentUser: JwtUser,
    @Args('designId') designId: string,
  ): Promise<DesignType> {
    return this.designsService.toggleLike(designId, currentUser.id);
  }

  @Mutation(() => DesignType)
  @UseGuards(GqlAuthGuard)
  async toggleSave(
    @CurrentUser() currentUser: JwtUser,
    @Args('designId') designId: string,
  ): Promise<DesignType> {
    return this.designsService.toggleSave(designId, currentUser.id);
  }
}
