import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CloudinaryService } from './cloudinary.service.js';
import { UploadController } from './upload.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [UploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class UploadModule {}
