import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CouponsController } from './coupons.controller.js';
import { CouponsService } from './coupons.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
