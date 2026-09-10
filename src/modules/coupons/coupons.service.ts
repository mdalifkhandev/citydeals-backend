import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { FilterCouponDto } from './dto/filter-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: { role: string; areaId?: string | null }, dto: CreateCouponDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id: dto.merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    if (user.role !== 'ADMIN' && merchant.areaId !== user.areaId) {
      throw new ForbiddenException('Cannot create coupons outside your area');
    }
    return this.prisma.coupon.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        couponCode: dto.couponCode,
        couponLink: dto.couponLink,
        redemptionLimit: dto.redemptionLimit,
        redemptionFrequency: dto.redemptionFrequency,
        discussion: dto.discussion,
        terms: dto.terms,
        merchantId: dto.merchantId,
        areaId: merchant.areaId,
        categoryId: dto.categoryId,
        isWhitelisted: dto.isWhitelisted ?? false,
        shareSlug: randomUUID(),
        status: 'ACTIVE',
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async find(user: { role?: string; areaId?: string | null } | null, filter: FilterCouponDto) {
    const area = filter.areaSlug
      ? await this.prisma.area.findUnique({ where: { slug: filter.areaSlug } })
      : null;
    const areaId = user?.role === 'ADMIN' ? area?.id ?? user.areaId : area?.id ?? user?.areaId;
    if (!areaId) throw new ForbiddenException('Area scope is required');
    return this.prisma.coupon.findMany({
      where: { areaId, merchantId: filter.merchantId, status: 'ACTIVE' },
      include: { merchant: true, area: true, category: true },
      orderBy: [{ isWhitelisted: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findPublicByShareSlug(shareSlug: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { shareSlug },
      include: { merchant: true, area: true, category: true },
    });
    if (!coupon || coupon.status !== 'ACTIVE') {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async saveCoupon(userId: string, couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    try {
      return await this.prisma.savedCoupon.create({ data: { userId, couponId } });
    } catch {
      throw new ConflictException('Coupon is already saved');
    }
  }

  async unsaveCoupon(userId: string, couponId: string) {
    await this.prisma.savedCoupon.deleteMany({ where: { userId, couponId } });
    return { couponId, saved: false };
  }

  findSavedCoupons(userId: string) {
    return this.prisma.savedCoupon.findMany({
      where: { userId },
      include: { coupon: { include: { merchant: true, area: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, dto: UpdateCouponDto = {}) {
    const { startsAt, expiresAt, ...data } = dto;
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return { id, deleted: true };
  }
}
