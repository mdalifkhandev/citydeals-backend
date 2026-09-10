import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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
}
