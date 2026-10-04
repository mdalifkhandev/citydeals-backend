import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard.js';
import { CloudinaryService } from './cloudinary.service.js';
import { UploadBase64Dto } from './dto/upload-base64.dto.js';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(OptionalJwtAuthGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image file to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @ApiQuery({
    name: 'folder',
    required: false,
    example: 'avatars',
    description: 'Folder name in Cloudinary (e.g. avatars, coupons, merchants, categories)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload (JPEG, PNG, WebP, GIF)',
        },
        folder: {
          type: 'string',
          example: 'avatars',
          description: 'Optional subfolder in Cloudinary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|svg\+xml)$/)) {
          return cb(
            new BadRequestException('Only image files (jpg, jpeg, png, webp, gif, svg) are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') queryFolder?: string,
    @Body('folder') bodyFolder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const folder = bodyFolder || queryFolder || 'general';
    return this.cloudinaryService.uploadFile(file, { folder });
  }

  @Post('base64')
  @ApiOperation({ summary: 'Upload base64 encoded image or data URL to Cloudinary' })
  @ApiBearerAuth('access-token')
  async uploadBase64(@Body() dto: UploadBase64Dto) {
    return this.cloudinaryService.uploadBase64(dto.data, {
      folder: dto.folder || 'general',
      publicId: dto.publicId,
    });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete an image from Cloudinary by public ID' })
  @ApiBearerAuth('access-token')
  @ApiQuery({
    name: 'publicId',
    required: true,
    description: 'Cloudinary public ID (e.g. citydeals/avatars/sample)',
  })
  async deleteFile(@Query('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('publicId query parameter is required');
    }
    return this.cloudinaryService.deleteFile(publicId);
  }
}
