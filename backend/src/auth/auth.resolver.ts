import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterInput } from './dto/register.input.js';
import { LoginInput } from './dto/login.input.js';
import { AuthResponse, AuthUser } from './dto/auth.types.js';
import { GqlAuthGuard } from './guards/gql-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { GqlContext } from '../common/gql-context.js';

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  vendorType?: string;
  refreshToken?: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') input: RegisterInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(input);
    // Generate fresh tokens and set the refresh cookie
    const tokens = await this.authService.generateTokens(
      result.user.id,
      result.user.email,
      result.user.role,
    );
    await this.authService.storeRefreshToken(result.user.id, tokens.refreshToken);
    this.authService.setRefreshTokenCookie(ctx.res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user: result.user };
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(input.email, input.password);
    this.authService.setRefreshTokenCookie(ctx.res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Context() ctx: GqlContext,
  ): Promise<boolean> {
    await this.authService.logout(user.id, ctx.res);
    return true;
  }

  @Mutation(() => String)
  async refreshToken(@Context() ctx: GqlContext): Promise<string> {
    const cookies = ctx.req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    // Decode payload to get userId (actual verification happens inside refreshTokens)
    const parts = refreshToken.split('.');
    if (parts.length !== 3) throw new Error('Invalid refresh token format');
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    ) as { sub?: string };
    if (!payload.sub) throw new Error('Invalid refresh token');

    const accessToken = await this.authService.refreshTokens(
      payload.sub,
      refreshToken,
      ctx.res,
    );
    return accessToken;
  }

  @Query(() => AuthUser)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? '',
      role: user.role,
      vendorType: user.vendorType,
    };
  }
}
