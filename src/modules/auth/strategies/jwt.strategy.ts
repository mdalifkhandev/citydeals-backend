import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  areaId?: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtSecret') ?? 'dev-only-change-me',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, areaId: true, status: true },
    });
    if (user) {
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is not active');
      }
      return { id: user.id, email: user.email, role: user.role, areaId: user.areaId };
    }
    return { id: payload.sub, email: payload.email, role: payload.role, areaId: payload.areaId };
  }
}
