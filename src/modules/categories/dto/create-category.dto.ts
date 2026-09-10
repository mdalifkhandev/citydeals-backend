import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'food' })
  @IsString()
  slug!: string;

  @ApiPropertyOptional({ example: 'https://cdn.citydeals.test/categories/food.png' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
