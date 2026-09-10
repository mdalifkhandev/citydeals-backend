import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MerchantsController } from './merchants.controller.js';
import { MerchantsService } from './merchants.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [MerchantsController],
  providers: [MerchantsService],
})
export class MerchantsModule {}
