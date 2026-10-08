import { Injectable } from '@nestjs/common';
import { haversineDistanceMeters } from '../../common/utils/geo.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { AreasService } from '../areas/areas.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SyncLocationDto } from '../auth/dto/sync-location.dto.js';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly areasService: AreasService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sync(user: { id: string }, dto: SyncLocationDto) {
    const area = await this.areasService.resolveArea(dto.latitude, dto.longitude);
    const merchants = area
      ? await this.prisma.merchant.findMany({ where: { areaId: area.id } })
      : [];

    const nearbyMerchants = merchants
      .map((merchant) => ({
        ...merchant,
        distanceMeters: haversineDistanceMeters(
          { latitude: dto.latitude, longitude: dto.longitude },
          { latitude: Number(merchant.latitude), longitude: Number(merchant.longitude) },
        ),
      }))
      .filter((merchant) => merchant.distanceMeters <= merchant.radiusMeters);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { latitude: dto.latitude, longitude: dto.longitude, fcmToken: dto.fcmToken, areaId: area?.id },
    });

    await Promise.all(
      nearbyMerchants.map((merchant) =>
        this.notificationsService.enqueueProximityNotification({
          userId: user.id,
          merchantId: merchant.id,
          title: `Deal nearby: ${merchant.name}`,
          body: 'Open CityDeals to see offers near you.',
        }),
      ),
    );

    return {
      area,
      geofences: merchants.map((merchant) => ({
        merchantId: merchant.id,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        radiusMeters: merchant.radiusMeters,
      })),
    };
  }
}
