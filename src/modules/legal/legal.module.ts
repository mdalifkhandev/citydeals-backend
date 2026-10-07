import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LegalController } from './legal.controller.js';
import { LegalService } from './legal.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [LegalController],
  providers: [LegalService],
  exports: [LegalService],
})
export class LegalModule {}
