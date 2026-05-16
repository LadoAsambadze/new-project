import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import express from 'express';
import { AuthService, GoogleUser, FacebookUser } from './auth.service.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { FacebookAuthGuard } from './guards/facebook-auth.guard.js';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const googleUser = req.user as GoogleUser;
    const result = await this.authService.googleLogin(googleUser);

    this.authService.setRefreshTokenCookie(res, result.refreshToken);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  facebookAuth() {
    // Initiates the Facebook OAuth flow
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const fbUser = req.user as FacebookUser;
    const result = await this.authService.facebookLogin(fbUser);

    this.authService.setRefreshTokenCookie(res, result.refreshToken);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }
}
