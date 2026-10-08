import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'required_permission';

/**
 * Marks a route as requiring a specific staff permission.
 * Works in conjunction with StaffPermissionGuard.
 * 
 * Permission IDs match those defined in the Roles & Permissions dashboard:
 * - manage-coupon-categories
 * - manage-business-profiles
 * - create-edit-coupons
 * - publish-coupons
 * - edit-app-pages
 * - delete-content
 * - manage-registered-users
 * - manage-staff-accounts
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);
