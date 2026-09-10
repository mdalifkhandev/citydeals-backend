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
}
