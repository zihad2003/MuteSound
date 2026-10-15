import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(req);
    if (!token) throw new UnauthorizedException({ message: 'Missing access token.', code: 'MISSING_TOKEN' });

    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException({ message: 'Invalid or expired access token.', code: 'INVALID_TOKEN' });
    }
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const auth = req.headers.authorization;
    if (!auth) return undefined;
    const [scheme, token] = auth.split(' ');
    return scheme === 'Bearer' ? token : undefined;
  }
}
