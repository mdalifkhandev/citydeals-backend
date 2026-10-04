import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UploadModule } from '../upload/upload.module.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UploadModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
