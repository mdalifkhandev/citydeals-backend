import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateMerchantDto } from './dto/create-merchant.dto.js';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: { id: string; role: string; areaId?: string | null }, dto: CreateMerchantDto) {
    const areaId = user.role === 'ADMIN' ? dto.areaId : user.areaId;
    if (!areaId) throw new ForbiddenException('Area is required');

    const area = await this.prisma.area.findUnique({ where: { id: areaId } });
    if (!area) throw new NotFoundException('Area not found');

    return this.prisma.merchant.create({
      data: {
        name: dto.name,
        description: dto.description,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        areaId,
        ownerId: user.role === 'ADVERTISER' ? user.id : undefined,
      },
    });
  }

  findForArea(user: { role: string; areaId?: string | null }, areaId?: string) {
    const scopedAreaId = user.role === 'ADMIN' ? areaId : user.areaId;
    if (!scopedAreaId) throw new ForbiddenException('Area scope is required');
    return this.prisma.merchant.findMany({ where: { areaId: scopedAreaId }, orderBy: { name: 'asc' } });
  }
}
