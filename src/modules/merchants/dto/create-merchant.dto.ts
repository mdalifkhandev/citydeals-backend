import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum MerchantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateMerchantDto {
  @ApiPropertyOptional({
    example: 'replace-with-created-area-id',
    description: 'Required for ADMIN users. ADVERTISER users are scoped to their assigned area.',
  })
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiProperty({
    example: 'Kendall Coffee House',
    description: 'Merchant business name.',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Label' })
  @IsOptional()
  @IsString()
  titleText?: string;

  @ApiPropertyOptional({ example: 'https://cdn.citydeals.test/business/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'replace-with-created-category-id' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'Local cafe with breakfast, espresso, and lunch deals.',
    description: 'Short merchant profile for the directory.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '123 Kendall Dr, Kendall, FL',
    description: 'Public merchant address.',
  })
  @IsString()
  address!: string;

  @ApiPropertyOptional({ example: '+15111119991' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'business@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://www.example.com' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/username' })
  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/username' })
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional({ example: 'https://tiktok.com/@username' })
  @IsOptional()
  @IsString()
  tiktokUrl?: string;

  @ApiProperty({
    example: 25.6862,
    description: 'Merchant latitude used for proximity notifications.',
  })
  @IsNumber()
  latitude!: number;

  @ApiProperty({
    example: -80.3131,
    description: 'Merchant longitude used for proximity notifications.',
  })
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsOptional()
  @IsNumber()
  radiusMeters?: number;

  @ApiPropertyOptional({ enum: MerchantStatus, example: MerchantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MerchantStatus)
  status?: MerchantStatus;
}
