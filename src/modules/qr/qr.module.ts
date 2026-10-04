import { Module } from '@nestjs/common';
import { QrService } from './qr.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}

