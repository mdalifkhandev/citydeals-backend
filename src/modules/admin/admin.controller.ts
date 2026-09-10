import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { AdminService } from './admin.service.js';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UpsertRolePermissionsDto } from './dto/upsert-role-permissions.dto.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly dashboard: AdminDashboardService,
  ) {}

  @Get('dashboard/stats') stats() { return this.dashboard.stats(); }
  @Get('dashboard/redemptions/daily') daily() { return this.dashboard.dailyRedemptions(); }
  @Get('dashboard/redemptions/by-area') byArea() { return this.dashboard.redemptionsByArea(); }
  @Get('dashboard/trending-coupons') trending() { return this.dashboard.trendingCoupons(); }
  @Get('users') users() { return this.admin.users(); }
  @Get('users/:id') user(@Param('id') id: string) { return this.admin.user(id); }
  @Patch('users/:id/status') updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) { return this.admin.updateUserStatus(id, dto); }
  @Get('staff') staff() { return this.admin.staff(); }
  @Patch('staff/:id/role') updateStaffRole(@Param('id') id: string, @Body() dto: UpdateStaffRoleDto) { return this.admin.updateStaffRole(id, dto); }
  @Get('roles') roles() { return this.admin.roles(); }
  @Patch('roles/permissions') permissions(@Body() dto: UpsertRolePermissionsDto) { return this.admin.upsertRolePermissions(dto); }
}
