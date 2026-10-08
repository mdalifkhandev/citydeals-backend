import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UpsertRolePermissionsDto } from './dto/upsert-role-permissions.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  users() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
        _count: { select: { savedCoupons: true, couponRedemptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  user(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { area: true, savedCoupons: true, couponRedemptions: true },
    });
  }

  updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    return this.prisma.user.update({ where: { id }, data: { status: dto.status } });
  }

  staff() {
    return this.prisma.staffAccount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateStaffRole(id: string, dto: UpdateStaffRoleDto) {
    return this.prisma.staffAccount.update({ where: { id }, data: { roleKey: dto.roleKey } });
  }

  roles() {
    return this.prisma.staffRole.findMany({ orderBy: { name: 'asc' } });
  }

  upsertRolePermissions(dto: UpsertRolePermissionsDto) {
    return this.prisma.staffRole.upsert({
      where: { key: dto.roleKey },
      update: { permissions: dto.permissions },
      create: {
        key: dto.roleKey,
        name: dto.roleKey.replaceAll('-', ' '),
        permissions: dto.permissions,
      },
    });
  }

  async redemptions(
    user: { id: string; role: string; areaId?: string | null },
    areaId?: string,
    search?: string,
  ) {
    const scopedAreaId = user.role === 'ADVERTISER' ? user.areaId : areaId;

    const where: any = {};
    if (scopedAreaId) {
      where.coupon = { areaId: scopedAreaId };
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { user: { fullName: { contains: term, mode: 'insensitive' } } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: term, mode: 'insensitive' } } },
        { coupon: { title: { contains: term, mode: 'insensitive' } } },
        { coupon: { couponCode: { contains: term, mode: 'insensitive' } } },
        { coupon: { merchant: { name: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [items, total, todayCount, thisWeekCount, thisMonthCount] = await Promise.all([
      this.prisma.couponRedemption.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          coupon: {
            select: {
              id: true,
              title: true,
              couponCode: true,
              imageUrl: true,
              area: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                },
              },
              merchant: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.couponRedemption.count({ where }),
      this.prisma.couponRedemption.count({
        where: {
          ...(scopedAreaId ? { coupon: { areaId: scopedAreaId } } : {}),
          createdAt: { gte: todayStart },
        },
      }),
      this.prisma.couponRedemption.count({
        where: {
          ...(scopedAreaId ? { coupon: { areaId: scopedAreaId } } : {}),
          createdAt: { gte: weekStart },
        },
      }),
      this.prisma.couponRedemption.count({
        where: {
          ...(scopedAreaId ? { coupon: { areaId: scopedAreaId } } : {}),
          createdAt: { gte: monthStart },
        },
      }),
    ]);

    return {
      items,
      total,
      todayCount,
      thisWeekCount,
      thisMonthCount,
    };
  }
}
