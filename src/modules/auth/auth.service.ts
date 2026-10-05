import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
import { AreasService } from '../areas/areas.service.js';
import { MailService } from '../mail/mail.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SyncLocationDto } from './dto/sync-location.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly areasService: AreasService,
    private readonly mailService: MailService,
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
      include: {
        area: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profilePictureUrl: true,
        role: true,
        status: true,
        areaId: true,
        latitude: true,
        longitude: true,
        _count: {
          select: {
            savedCoupons: true,
            couponRedemptions: true,
            notifications: { where: { readAt: null } },
          },
        },
        area: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      ...user,
      stats: {
        savedCoupons: user._count.savedCoupons,
        couponRedeemed: user._count.couponRedemptions,
        unreadNotifications: user._count.notifications,
      },
      _count: undefined,
    };
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
      select: {
        id: true,
        areaId: true,
        latitude: true,
        longitude: true,
        area: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true,
          },
        },
      },
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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOtp: otp,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    console.log(`[AUTH] 🔑 Password reset OTP for ${user.email}: ${otp}`);

    await this.mailService.sendPasswordResetOtp(user.email, otp, user.fullName ?? undefined);

    return {
      success: true,
      message: 'Verification code sent to your email address.',
      ...(process.env.NODE_ENV !== 'production' ? { otp } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.resetPasswordOtp || !user.resetPasswordExpiresAt) {
      throw new BadRequestException('No pending password reset request found for this email.');
    }

    if (user.resetPasswordOtp !== dto.otp) {
      throw new BadRequestException('Invalid verification code. Please check and try again.');
    }

    if (new Date() > user.resetPasswordExpiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    return {
      success: true,
      message: 'Verification code is valid.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.resetPasswordOtp || !user.resetPasswordExpiresAt) {
      throw new BadRequestException('No pending password reset request found for this email.');
    }

    if (user.resetPasswordOtp !== dto.otp) {
      throw new BadRequestException('Invalid verification code. Please check and try again.');
    }

    if (new Date() > user.resetPasswordExpiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordOtp: null,
        resetPasswordExpiresAt: null,
        refreshTokenHash: null,
      },
    });

    return {
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new password.',
    };
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
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          area: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              state: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      });
      if (!user || !user.refreshTokenHash) {
        throw new ForbiddenException('Access Denied');
      }
      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access Denied');
      }
      return this.issueTokens(user);
    } catch {
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
    const { passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, ...userWithoutSecrets } = user;
    
    return { 
      user: userWithoutSecrets,
      tokens: { accessToken, refreshToken } 
    };
  }
}
