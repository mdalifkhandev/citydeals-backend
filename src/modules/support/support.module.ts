import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupportController } from './support.controller.js';
import { SupportService } from './support.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
