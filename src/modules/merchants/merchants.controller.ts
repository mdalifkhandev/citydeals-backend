import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CreateMerchantDto } from './dto/create-merchant.dto.js';
import { MerchantsService } from './merchants.service.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Merchants')
@ApiBearerAuth('access-token')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Roles('ADMIN', 'ADVERTISER')
  @Post()
  create(@GetUser() user: { id: string; role: string; areaId?: string | null }, @Body() dto: CreateMerchantDto) {
    return this.merchantsService.create(user, dto);
  }

  @Get()
  findForArea(@GetUser() user: { role: string; areaId?: string | null }, @Query('areaId') areaId?: string) {
    return this.merchantsService.findForArea(user, areaId);
  }
}
