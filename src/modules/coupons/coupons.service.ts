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
    let areaId = filter.areaId;
    const isAllArea =
      filter.areaSlug?.toLowerCase() === 'all' ||
      filter.areaId?.toLowerCase() === 'all';

    if (!isAllArea) {
      if (!areaId && filter.areaSlug) {
        const area = await this.prisma.area.findUnique({ where: { slug: filter.areaSlug } });
        areaId = area?.id;
      }
      if (!areaId && user?.areaId) {
        areaId = user.areaId;
      }
    } else {
      areaId = undefined;
    }

    let categoryId = filter.categoryId;
    if (!categoryId && filter.categorySlug && filter.categorySlug.toLowerCase() !== 'all') {
      const category = await this.prisma.category.findUnique({
        where: { slug: filter.categorySlug.toLowerCase() },
      });
      categoryId = category?.id;
    }

    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (areaId) {
      whereClause.areaId = areaId;
    }

    if (filter.merchantId) {
      whereClause.merchantId = filter.merchantId;
    }

    if (categoryId && categoryId.toLowerCase() !== 'all') {
      whereClause.categoryId = categoryId;
    }

    if (filter.search && filter.search.trim().length > 0) {
      const query = filter.search.trim();
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { couponCode: { contains: query, mode: 'insensitive' } },
        { merchant: { name: { contains: query, mode: 'insensitive' } } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.coupon.findMany({
      where: whereClause,
      include: {
        merchant: {
          include: { category: true },
        },
        area: true,
        category: true,
      },
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
