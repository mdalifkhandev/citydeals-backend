import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StaffPermissionGuard } from '../../common/guards/staff-permission.guard.js';
import { PrismaService } from '../../database/prisma.service.js';
import { MerchantsController } from './merchants.controller.js';
import { MerchantsService } from './merchants.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [MerchantsController],
  providers: [MerchantsService, StaffPermissionGuard, PrismaService],
})
export class MerchantsModule {}
