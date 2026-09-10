import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AreasModule } from '../areas/areas.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { LocationController } from './location.controller.js';
import { LocationService } from './location.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AreasModule, NotificationsModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
