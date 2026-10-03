import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
import { AreasService } from '../areas/areas.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SyncLocationDto } from './dto/sync-location.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly areasService: AreasService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.acceptedTerms) {
      throw new BadRequestException('Terms and conditions must be accepted');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const area = dto.latitude && dto.longitude
      ? await this.areasService.resolveArea(dto.latitude, dto.longitude)
      : null;
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        profilePictureUrl: dto.profilePictureUrl,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        passwordHash: await bcrypt.hash(dto.password, 12),
        role: dto.role ?? 'USER',
        preferredLanguage: dto.preferredLanguage ?? 'en',
        acceptedTerms: dto.acceptedTerms,
        onboardingCompleted: dto.onboardingCompleted ?? true,
        notificationsPaused: dto.notificationsPaused ?? false,
        areaId: area?.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async syncLocation(userId: string, dto: SyncLocationDto) {
    const area = await this.areasService.resolveArea(dto.latitude, dto.longitude);
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        fcmToken: dto.fcmToken,
        areaId: area?.id,
      },
      select: { id: true, areaId: true, latitude: true, longitude: true },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 12),
        refreshTokenHash: null,
      },
    });
    return { passwordChanged: true };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { loggedOut: true };
  }


  async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new ForbiddenException('No refresh token provided');
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('auth.refreshSecret') ?? 'dev-only-refresh-change-me'
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.refreshTokenHash) {
        throw new ForbiddenException('Access Denied');
      }
      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access Denied');
      }
      return this.issueTokens(user);
    } catch (e) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }

  private async issueTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, areaId: user.areaId };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshOptions: JwtSignOptions = {
      secret: this.configService.get<string>('auth.refreshSecret') ?? 'dev-only-refresh-change-me',
      expiresIn: this.configService.get<string>('auth.refreshExpiresIn') ?? '30d',
    } as JwtSignOptions;
    const refreshToken = await this.jwtService.signAsync(payload, refreshOptions);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 12) },
    });
    
    // Don't leak password hash
    const { passwordHash, refreshTokenHash, ...userWithoutSecrets } = user;
    
    return { 
      user: userWithoutSecrets,
      tokens: { accessToken, refreshToken } 
    };
  }
}
