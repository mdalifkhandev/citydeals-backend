import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StaffPermissionGuard } from '../../common/guards/staff-permission.guard.js';
import { PrismaService } from '../../database/prisma.service.js';
import { CouponsController } from './coupons.controller.js';
import { CouponsService } from './coupons.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CouponsController],
  providers: [CouponsService, StaffPermissionGuard, PrismaService],
})
export class CouponsModule {}
