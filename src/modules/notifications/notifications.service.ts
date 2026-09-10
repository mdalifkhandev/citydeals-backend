import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service.js';
import { ListNotificationsDto } from './dto/list-notifications.dto.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';

export const PROXIMITY_QUEUE = 'proximity-notifications';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue(PROXIMITY_QUEUE) private readonly queue: Queue<SendNotificationDto>,
    private readonly prisma: PrismaService,
  ) {}

  enqueueProximityNotification(dto: SendNotificationDto) {
    return this.queue.add('send-proximity', dto, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
    });
  }

  async findMine(userId: string, query: ListNotificationsDto) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 50);
    const readFilter = query.read === undefined ? undefined : query.read === 'true';
    const where = {
      userId,
      readAt: readFilter === undefined ? undefined : readFilter ? { not: null } : null,
    };
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit), unreadCount } };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
}
