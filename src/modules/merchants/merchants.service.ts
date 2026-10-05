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
        titleText: dto.titleText,
        logoUrl: dto.logoUrl,
        categoryId: dto.categoryId,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        websiteUrl: dto.websiteUrl,
        instagramUrl: dto.instagramUrl,
        facebookUrl: dto.facebookUrl,
        tiktokUrl: dto.tiktokUrl,
        radiusMeters: dto.radiusMeters,
        status: dto.status,
        latitude: dto.latitude,
        longitude: dto.longitude,
        areaId,
        ownerId: user.role === 'ADVERTISER' ? user.id : undefined,
      },
    });
  }

  findForArea(user: { role: string; areaId?: string | null }, areaId?: string) {
    const scopedAreaId = user.role === 'ADMIN' ? areaId : user.areaId;
    if (!scopedAreaId && user.role !== 'ADMIN') throw new ForbiddenException('Area scope is required');
    return this.prisma.merchant.findMany({
      where: scopedAreaId ? { areaId: scopedAreaId } : {},
      include: { area: true, category: true },
      orderBy: { name: 'asc' },
    });
  }

  update(id: string, dto: Partial<CreateMerchantDto>) {
    return this.prisma.merchant.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.merchant.delete({ where: { id } });
    return { id, deleted: true };
  }
}
