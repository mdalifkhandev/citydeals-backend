import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { QrModule } from '../qr/qr.module.js';
import { AreasController } from './areas.controller.js';
import { AreasService } from './areas.service.js';
import { DirectoryController } from './directory.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), QrModule],
  controllers: [AreasController, DirectoryController],
  providers: [AreasService],
  exports: [AreasService],
})
export class AreasModule {}
