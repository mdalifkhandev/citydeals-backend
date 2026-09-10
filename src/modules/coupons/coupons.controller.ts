import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CouponsService } from './coupons.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { FilterCouponDto } from './dto/filter-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'ADVERTISER')
  @Post()
  create(@GetUser() user: { role: string; areaId?: string | null }, @Body() dto: CreateCouponDto) {
    return this.couponsService.create(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get()
  find(@GetUser() user: { role: string; areaId?: string | null }, @Query() filter: FilterCouponDto) {
    return this.couponsService.find(user, filter);
  }

  @Get('public/:shareSlug')
  findPublicByShareSlug(@Param('shareSlug') shareSlug: string) {
    return this.couponsService.findPublicByShareSlug(shareSlug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('saved')
  findSavedCoupons(@GetUser() user: { id: string }) {
    return this.couponsService.findSavedCoupons(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/save')
  saveCoupon(@GetUser() user: { id: string }, @Param('id') id: string) {
    return this.couponsService.saveCoupon(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id/save')
  unsaveCoupon(@GetUser() user: { id: string }, @Param('id') id: string) {
    return this.couponsService.unsaveCoupon(user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'ADVERTISER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto = {}) {
    return this.couponsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
