import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StaffPermissionGuard } from '../../common/guards/staff-permission.guard.js';
import { PrismaService } from '../../database/prisma.service.js';
import { LegalController } from './legal.controller.js';
import { LegalService } from './legal.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [LegalController],
  providers: [LegalService, StaffPermissionGuard, PrismaService],
  exports: [LegalService],
})
export class LegalModule {}
