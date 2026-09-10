import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterCouponDto {
  @ApiPropertyOptional({
    example: 'kendall',
    description: 'Area slug for scoped coupon listing, e.g. /coupons?areaSlug=kendall.',
  })
  @IsOptional()
  @IsString()
  areaSlug?: string;

  @ApiPropertyOptional({
    example: 'replace-with-created-merchant-id',
    description: 'Optional merchant id filter within the selected area.',
  })
  @IsOptional()
  @IsString()
  merchantId?: string;
}
