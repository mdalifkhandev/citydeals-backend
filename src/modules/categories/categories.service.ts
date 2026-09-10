import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  findAll() {
    return this.prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async findCoupons(categorySlug: string, areaSlug?: string) {
    const category = await this.prisma.category.findUnique({ where: { slug: categorySlug } });
    const area = areaSlug ? await this.prisma.area.findUnique({ where: { slug: areaSlug } }) : null;
    return this.prisma.coupon.findMany({
      where: {
        categoryId: category?.id ?? '__missing__',
        areaId: area?.id,
        status: 'ACTIVE',
      },
      include: { merchant: true, area: true, category: true },
      orderBy: [{ isWhitelisted: 'desc' }, { createdAt: 'desc' }],
    });
  }

  update(id: string, dto: Partial<CreateCategoryDto>) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { id, deleted: true };
  }
}
