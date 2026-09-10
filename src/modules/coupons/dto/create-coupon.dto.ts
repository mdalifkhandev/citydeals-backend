import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({
    example: 'Buy 1 Coffee, Get 1 Free',
    description: 'Coupon title shown in app and share preview.',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Show this coupon at checkout to get a free coffee with any coffee purchase.',
    description: 'Full coupon terms or marketing copy.',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    example: 'https://cdn.citydeals.test/coupons/kendall-coffee-bogo.jpg',
    description: 'Coupon image used in listings and OG share previews.',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'replace-with-created-merchant-id',
    description: 'Create a merchant first, then paste its id here.',
  })
  @IsString()
  merchantId!: string;

  @ApiPropertyOptional({
    example: 'replace-with-created-category-id',
    description: 'Optional category id used for category tab filtering.',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Featured/whitelisted coupons appear first in listings.',
  })
  @IsOptional()
  @IsBoolean()
  isWhitelisted?: boolean;

  @ApiPropertyOptional({
    example: '2026-09-10T00:00:00.000Z',
    description: 'Optional coupon start date/time.',
  })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Optional coupon expiry date/time.',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
