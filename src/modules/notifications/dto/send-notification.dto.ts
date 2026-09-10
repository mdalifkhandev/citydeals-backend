import { IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SendNotificationDto {
  @ApiPropertyOptional({ example: 'replace-with-user-id' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'replace-with-merchant-id' })
  @IsOptional()
  @IsString()
  merchantId?: string;

  @ApiProperty({ example: 'New coupon available' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Open CityDeals to see the latest offer.' })
  @IsString()
  body!: string;

  @ApiPropertyOptional({ example: 'ALL', enum: ['ALL', 'USER', 'AREA'] })
  @IsOptional()
  @IsString()
  sendTo?: 'ALL' | 'USER' | 'AREA';

  @ApiPropertyOptional({ example: 'replace-with-area-id' })
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiPropertyOptional({ example: '2026-09-10T18:00:00.000Z' })
  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: 'NONE', enum: ['NONE', 'DAILY', 'WEEKLY'] })
  @IsOptional()
  @IsString()
  repeat?: 'NONE' | 'DAILY' | 'WEEKLY';
}
