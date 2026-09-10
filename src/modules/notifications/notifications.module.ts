import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { NotificationsController } from './notifications.controller.js';
import { PROXIMITY_QUEUE, NotificationsService } from './notifications.service.js';
import { NotificationsProcessor } from './notifications.processor.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), BullModule.registerQueue({ name: PROXIMITY_QUEUE })],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
