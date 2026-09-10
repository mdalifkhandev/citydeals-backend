import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class ShareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getCouponShareData(shareSlug: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { shareSlug },
      include: { merchant: true, area: true },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const baseUrl = this.configService.get<string>('app.publicBaseUrl');
    const title = `${coupon.title} at ${coupon.merchant.name}`;
    const description = coupon.description;
    const image = coupon.imageUrl ?? `${baseUrl}/og/default-coupon.png`;

    return {
      shareUrl: `${baseUrl}/c/${shareSlug}`,
      title,
      description,
      image,
      coupon,
      links: {
        coupon: `${baseUrl}/coupons/public/${coupon.shareSlug}`,
        directory: `${baseUrl}/directory/${coupon.area.slug}`,
      },
      socialPreview: {
        ogTitle: title,
        ogDescription: description,
        ogImage: image,
        ogUrl: `${baseUrl}/c/${shareSlug}`,
      },
    };
  }
}
