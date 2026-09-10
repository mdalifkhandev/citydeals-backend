import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({ example: 'coffee', description: 'Search text for coupon title, merchant name, address, category, or area.' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'kendall', description: 'Area slug to scope results.' })
  @IsOptional()
  @IsString()
  areaSlug?: string;

  @ApiPropertyOptional({ example: 'food', description: 'Category slug filter.' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
