import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadBase64Dto {
  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE...',
    description: 'Base64 encoded image string or data URI',
  })
  @IsString()
  @IsNotEmpty()
  data: string;

  @ApiPropertyOptional({
    example: 'avatars',
    description: 'Folder or category for the image (e.g. avatars, coupons, merchants, qr)',
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    example: 'custom-file-id',
    description: 'Optional custom public ID for Cloudinary',
  })
  @IsOptional()
  @IsString()
  publicId?: string;
}
