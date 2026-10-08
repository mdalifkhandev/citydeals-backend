import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StaffPermissionGuard } from '../../common/guards/staff-permission.guard.js';
import { PrismaService } from '../../database/prisma.service.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CategoriesController],
  providers: [CategoriesService, StaffPermissionGuard, PrismaService],
})
export class CategoriesModule {}
