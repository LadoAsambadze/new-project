import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') ?? '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') ?? '',
      callbackURL: `${configService.get<string>('BACKEND_URL')}/auth/facebook/callback`,
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'picture'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: unknown) => void,
  ) {
    const { id, emails, name, photos } = profile;
    const email = emails?.[0]?.value ?? '';
    const firstName = name?.givenName ?? '';
    const lastName = name?.familyName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const avatar = photos?.[0]?.value;

    done(null, {
      facebookId: id,
      email,
      name: fullName || profile.displayName,
      avatar,
    });
  }
}
