import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service.js';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator.js';

/**
 * StaffPermissionGuard enforces fine-grained permissions for ADMIN role users.
 * 
 * Flow:
 * 1. Checks if the route has @RequirePermission('some-permission-id')
 * 2. If no permission required → allow (other guards handle auth)
 * 3. If user is super-administrator → allow all (bypass check)
 * 4. Looks up StaffAccount by email to find their roleKey
 * 5. Looks up StaffRole.permissions for that roleKey
 * 6. Checks if permissions['some-permission-id'] === true
 * 
 * Non-ADMIN users (USER, ADVERTISER) are not affected by this guard.
 */
@Injectable()
export class StaffPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permission annotation → this guard is not applicable
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<{
      user?: { id: string; email: string; role: string };
    }>();

    const user = request.user;
    if (!user) return false;

    // Non-admin users are not subject to staff permissions
    if (user.role !== 'ADMIN') return true;

    // Fetch the staff account by email to get their role key
    const staffAccount = await this.prisma.staffAccount.findUnique({
      where: { email: user.email },
      select: { roleKey: true },
    });

    if (!staffAccount) {
      // This is a system ADMIN (user registered with ADMIN role in User table)
      // but has no StaffAccount — grant full access
      return true;
    }

    const roleKey = staffAccount.roleKey.toLowerCase().replace(/\s+/g, '-');

    // Super-administrator bypasses all permission checks
    if (roleKey === 'super-administrator' || roleKey === 'administrator') {
      return true;
    }

    // Fetch the role's permissions from StaffRole
    const staffRole = await this.prisma.staffRole.findUnique({
      where: { key: roleKey },
      select: { permissions: true },
    });

    if (!staffRole) {
      throw new ForbiddenException(
        `Role "${roleKey}" not found. Contact an administrator.`,
      );
    }

    const permissions = staffRole.permissions as Record<string, boolean> | null ?? {};
    const hasPermission = permissions[requiredPermission] === true;

    if (!hasPermission) {
      throw new ForbiddenException(
        `Your role does not have permission to perform this action. Required: "${requiredPermission}"`,
      );
    }

    return true;
  }
}
