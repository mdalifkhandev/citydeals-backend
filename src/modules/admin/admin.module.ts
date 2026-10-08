import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StaffPermissionGuard } from '../../common/guards/staff-permission.guard.js';
import { PrismaService } from '../../database/prisma.service.js';
import { AdminController } from './admin.controller.js';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { AdminService } from './admin.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AdminController],
  providers: [AdminService, AdminDashboardService, StaffPermissionGuard, PrismaService],
})
export class AdminModule {}
