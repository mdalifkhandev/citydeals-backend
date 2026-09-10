import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../database/prisma.service.js';
import { PROXIMITY_QUEUE } from './notifications.service.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

@Injectable()
@Processor(PROXIMITY_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<SendNotificationDto>) {
    const { userId, merchantId } = job.data;
    if (!userId || !merchantId) return { skipped: true, reason: 'missing_proximity_target' };
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsPaused: true },
    });
    if (user?.notificationsPaused) return { skipped: true, reason: 'notifications_paused' };

    const cooldown = await this.prisma.notificationCooldown.findUnique({
      where: { userId_merchantId: { userId, merchantId } },
    });
    if (cooldown && Date.now() - cooldown.lastSentAt.getTime() < COOLDOWN_MS) return { skipped: true };

    await this.prisma.notificationCooldown.upsert({
      where: { userId_merchantId: { userId, merchantId } },
      update: { lastSentAt: new Date() },
      create: { userId, merchantId, lastSentAt: new Date() },
    });
    await this.prisma.notification.create({
      data: {
        userId,
        title: job.data.title,
        body: job.data.body,
        data: { merchantId },
      },
    });
    return { sent: true };
  }
}
