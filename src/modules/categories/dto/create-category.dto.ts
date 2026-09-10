import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

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

  @ApiPropertyOptional({ example: 'Restaurants, cafes, and local dining offers.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CategoryStatus, example: CategoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
