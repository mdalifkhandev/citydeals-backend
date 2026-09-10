import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SyncLocationDto {
  @ApiProperty({
    example: 25.685,
    description: 'Current user latitude.',
  })
  @IsNumber()
  latitude!: number;

  @ApiProperty({
    example: -80.312,
    description: 'Current user longitude. Demo value is near Kendall, Florida.',
  })
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({
    example: 'demo-fcm-token',
    description: 'Optional Firebase Cloud Messaging token for push notifications.',
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
