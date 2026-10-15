import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';

import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthDto, LoginDto, RefreshTokenDto, SignupDto } from './dto/auth.dto';
import { JwtPayload } from '../common/decorators/current-user.decorator';
import { PrayerName, formatPrayerList } from '../common/types/enums';

export interface TokenPair {
  token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const googleClientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID', '');
    if (googleClientId && !googleClientId.startsWith('replace_me')) {
      this.googleClient = new OAuth2Client(googleClientId);
    }
  }

  async signup(dto: SignupDto): Promise<{ id: string; email: string; token: string; refresh_token: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({ message: 'Email already registered.', code: 'EMAIL_ALREADY_EXISTS' });
    }

    let passwordHash: string | null = null;
    try {
      passwordHash = await argon2.hash(dto.password);
    } catch (e) {
      throw new InternalServerErrorException({ message: 'Error creating account.', code: 'HASH_FAILED' });
    }

    const defaultPrayers: PrayerName[] = [
      PrayerName.fajr,
      PrayerName.dhuhr,
      PrayerName.asr,
      PrayerName.maghrib,
      PrayerName.isha,
    ];

    const user = await this.prisma.user.create({
      data: {
        id: uuidv4(),
        email: dto.email,
        passwordHash,
        mutePreference: {
          create: {
            id: uuidv4(),
            enabledPrayers: formatPrayerList(defaultPrayers),
            muteDurationMinutes: 5,
            mlVerificationEnabled: false,
          },
        },
      },
    });

    const tokens = await this.issueTokens(user.id, user.email);
    return { id: user.id, email: user.email, ...tokens };
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({ message: 'Email or password is incorrect.', code: 'INVALID_CREDENTIALS' });
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException({ message: 'Email or password is incorrect.', code: 'INVALID_CREDENTIALS' });
    }
    return this.issueTokens(user.id, user.email);
  }

  async refresh(dto: RefreshTokenDto): Promise<{ token: string }> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refresh_token },
      include: { user: true },
    });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException({ message: 'Invalid or expired refresh token.', code: 'INVALID_REFRESH_TOKEN' });
    }
    const token = await this.signAccessToken(stored.userId, stored.user.email);
    return { token };
  }

  async googleAuth(dto: GoogleAuthDto): Promise<{ token: string; refresh_token: string; is_new_user: boolean }> {
    if (!this.googleClient) {
      throw new BadRequestException({ message: 'Google OAuth is not configured.', code: 'GOOGLE_NOT_CONFIGURED' });
    }
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.id_token,
        audience: this.configService.getOrThrow<string>('GOOGLE_OAUTH_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch (e) {
      throw new UnauthorizedException({ message: 'Invalid Google ID token.', code: 'INVALID_GOOGLE_TOKEN' });
    }
    if (!payload || !payload.email) {
      throw new UnauthorizedException({ message: 'Invalid Google token payload.', code: 'INVALID_GOOGLE_TOKEN' });
    }

    const email = payload.email;
    const googleId = payload.sub;

    let user = await this.prisma.user.findFirst({ where: { OR: [{ email }, { googleId }] } });
    let isNew = false;
    if (!user) {
      const defaultPrayers: PrayerName[] = [
        PrayerName.fajr,
        PrayerName.dhuhr,
        PrayerName.asr,
        PrayerName.maghrib,
        PrayerName.isha,
      ];
      user = await this.prisma.user.create({
        data: {
          id: uuidv4(),
          email,
          googleId,
          mutePreference: {
            create: {
              id: uuidv4(),
              enabledPrayers: formatPrayerList(defaultPrayers),
              muteDurationMinutes: 5,
              mlVerificationEnabled: false,
            },
          },
        },
      });
      isNew = true;
    } else if (!user.googleId) {
      user = await this.prisma.user.update({ where: { id: user.id }, data: { googleId } });
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return { ...tokens, is_new_user: isNew };
  }

  private async issueTokens(userId: string, email: string): Promise<TokenPair> {
    const token = await this.signAccessToken(userId, email);
    const refreshToken = uuidv4();

    const raw = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshExpiresDays = this.parseDays(raw);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpiresDays);

    await this.prisma.refreshToken.create({
      data: { id: uuidv4(), userId, token: refreshToken, expiresAt },
    });

    return { token, refresh_token: refreshToken };
  }

  private parseDays(raw: string): number {
    const match = /^(\d+)\s*[dD]?$/.exec(raw.trim());
    const days = match ? parseInt(match[1], 10) : NaN;
    return Number.isFinite(days) && days > 0 ? days : 7;
  }

  private async signAccessToken(userId: string, email: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, email };
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }
}
