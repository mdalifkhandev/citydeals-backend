import { Injectable, NotFoundException } from '@nestjs/common';
import { haversineDistanceMeters } from '../../common/utils/geo.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { QrService } from '../qr/qr.service.js';
import { CreateAreaDto } from './dto/create-area.dto.js';
import { UpdateAreaDto } from './dto/update-area.dto.js';

@Injectable()
export class AreasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrService: QrService,
  ) {}

  async create(dto: CreateAreaDto) {
    const area = await this.prisma.area.create({ data: dto });
    const qrCodeUrl = await this.qrService.generateAreaQrCode(area.slug);
    return this.prisma.area.update({ where: { id: area.id }, data: { qrCodeUrl } });
  }

  findAll() {
    return this.prisma.area.findMany({ orderBy: { name: 'asc' } });
  }

  async findBySlug(slug: string) {
    const area = await this.prisma.area.findUnique({ where: { slug } });
    if (!area) throw new NotFoundException('Area not found');
    return area;
  }

  async getDirectoryData(slug: string) {
    const area = await this.prisma.area.findUnique({
      where: { slug },
      include: {
        merchants: {
          include: {
            coupons: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!area) throw new NotFoundException('Area not found');

    return area;
  }

  async update(id: string, dto: UpdateAreaDto) {
    const current = await this.prisma.area.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Area not found');
    const qrCodeUrl = dto.slug && dto.slug !== current.slug
      ? await this.qrService.generateAreaQrCode(dto.slug)
      : undefined;
    return this.prisma.area.update({ where: { id }, data: { ...dto, qrCodeUrl } });
  }

  async resolveArea(latitude: number, longitude: number) {
    const areas = await this.prisma.area.findMany();
    return areas
      .map((area) => ({
        ...area,
        distanceMeters: haversineDistanceMeters(
          { latitude, longitude },
          { latitude: Number(area.latitude), longitude: Number(area.longitude) },
        ),
      }))
      .filter((area) => area.distanceMeters <= area.radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)[0] ?? null;
  }
}
