import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
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

  async staff() {
    let list = await this.prisma.staffAccount.findMany({ orderBy: { createdAt: 'desc' } });
    if (list.length === 0) {
      const defaults = [
        { fullName: 'Shuvo Ahmed', email: 'shuvo@citydeals.test', roleKey: 'Administrator' },
        { fullName: 'Anika Rahman', email: 'anika@citydeals.test', roleKey: 'Manager' },
        { fullName: 'Ravi Kumar', email: 'ravi@citydeals.test', roleKey: 'Editor' },
      ];
      for (const d of defaults) {
        await this.prisma.staffAccount.create({
          data: {
            fullName: d.fullName,
            email: d.email,
            roleKey: d.roleKey,
            status: 'ACTIVE',
          },
        }).catch(() => null);
      }
      list = await this.prisma.staffAccount.findMany({ orderBy: { createdAt: 'desc' } });
    }
    return list;
  }

  async createStaff(dto: CreateStaffDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.staffAccount.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException(`A staff account with email ${email} already exists`);
    }

    return this.prisma.staffAccount.create({
      data: {
        fullName: dto.fullName.trim(),
        email,
        roleKey: dto.roleKey,
        status: (dto.status as any) || 'ACTIVE',
      },
    });
  }

  async updateStaffRole(id: string, dto: UpdateStaffRoleDto) {
    const staff = await this.prisma.staffAccount.findUnique({ where: { id } });
    if (!staff) {
      throw new NotFoundException('Staff account not found');
    }
    return this.prisma.staffAccount.update({
      where: { id },
      data: { roleKey: dto.roleKey },
    });
  }

  async updateStaffStatus(id: string, status: string) {
    const staff = await this.prisma.staffAccount.findUnique({ where: { id } });
    if (!staff) {
      throw new NotFoundException('Staff account not found');
    }
    return this.prisma.staffAccount.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async deleteStaff(id: string) {
    const staff = await this.prisma.staffAccount.findUnique({ where: { id } });
    if (!staff) {
      throw new NotFoundException('Staff account not found');
    }
    return this.prisma.staffAccount.delete({ where: { id } });
  }

  async roles() {
    let roles = await this.prisma.staffRole.findMany({ orderBy: { name: 'asc' } });
    if (roles.length === 0) {
      const defaults = [
        { name: 'Super Administrator', key: 'super-administrator' },
        { name: 'Administrator', key: 'administrator' },
        { name: 'Manager', key: 'manager' },
        { name: 'Editor', key: 'editor' },
        { name: 'Viewer', key: 'viewer' },
      ];
      for (const d of defaults) {
        await this.prisma.staffRole.upsert({
          where: { key: d.key },
          update: {},
          create: {
            name: d.name,
            key: d.key,
            permissions: {},
          },
        }).catch(() => null);
      }
      roles = await this.prisma.staffRole.findMany({ orderBy: { name: 'asc' } });
    }
    return roles;
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

  async savedActivity(
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
        { coupon: { area: { name: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [items, total, todayCount, thisWeekCount] = await Promise.all([
      this.prisma.savedCoupon.findMany({
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
      this.prisma.savedCoupon.count({ where }),
      this.prisma.savedCoupon.count({
        where: {
          ...(scopedAreaId ? { coupon: { areaId: scopedAreaId } } : {}),
          createdAt: { gte: todayStart },
        },
      }),
      this.prisma.savedCoupon.count({
        where: {
          ...(scopedAreaId ? { coupon: { areaId: scopedAreaId } } : {}),
          createdAt: { gte: weekStart },
        },
      }),
    ]);

    return {
      items,
      total,
      todayCount,
      thisWeekCount,
    };
  }

  async shareAnalytics(
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
        { coupon: { title: { contains: term, mode: 'insensitive' } } },
        { coupon: { couponCode: { contains: term, mode: 'insensitive' } } },
        { coupon: { merchant: { name: { contains: term, mode: 'insensitive' } } } },
        { coupon: { area: { name: { contains: term, mode: 'insensitive' } } } },
        { channel: { contains: term, mode: 'insensitive' } },
      ];
    }

    const events = await this.prisma.couponShareEvent.findMany({
      where,
      include: {
        coupon: {
          select: {
            id: true,
            title: true,
            couponCode: true,
            area: { select: { id: true, name: true, city: true } },
            merchant: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const rowMap = new Map<string, any>();
    const channelMap = new Map<string, { channel: string; shares: number; opens: number }>();

    for (const event of events) {
      const channel = event.channel || 'SYSTEM';
      const key = `${event.couponId}:${channel}`;
      const row = rowMap.get(key) || {
        couponId: event.couponId,
        couponTitle: event.coupon.title,
        couponCode: event.coupon.couponCode,
        businessName: event.coupon.merchant?.name || null,
        areaName: event.coupon.area?.name || null,
        channel,
        shares: 0,
        opens: 0,
        lastActivityAt: event.createdAt,
      };

      const channelTotals = channelMap.get(channel) || { channel, shares: 0, opens: 0 };

      if (event.eventType === 'OPEN') {
        row.opens += 1;
        channelTotals.opens += 1;
      } else {
        row.shares += 1;
        channelTotals.shares += 1;
      }

      if (event.createdAt > row.lastActivityAt) {
        row.lastActivityAt = event.createdAt;
      }

      rowMap.set(key, row);
      channelMap.set(channel, channelTotals);
    }

    const rows = Array.from(rowMap.values())
      .map((row) => ({
        ...row,
        openRate: row.shares > 0 ? row.opens / row.shares : 0,
      }))
      .sort((a, b) => b.shares + b.opens - (a.shares + a.opens));

    const byChannel = Array.from(channelMap.values())
      .map((row) => ({
        ...row,
        openRate: row.shares > 0 ? row.opens / row.shares : 0,
      }))
      .sort((a, b) => b.shares + b.opens - (a.shares + a.opens));

    return {
      rows,
      byChannel,
      totalShares: rows.reduce((sum, row) => sum + row.shares, 0),
      totalOpens: rows.reduce((sum, row) => sum + row.opens, 0),
    };
  }
}
