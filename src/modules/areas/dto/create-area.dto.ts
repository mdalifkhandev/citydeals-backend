import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({
    example: 'Kendall',
    description: 'Display name of the isolated directory area.',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'kendall',
    description: 'Unique URL slug used for /directory/:slug and QR codes.',
  })
  @IsString()
  slug!: string;

  @ApiProperty({
    example: 'Kendall',
    description: 'City or neighborhood name.',
  })
  @IsString()
  city!: string;

  @ApiProperty({
    example: 'FL',
    description: 'State abbreviation or name.',
  })
  @IsString()
  state!: string;

  @ApiProperty({
    example: 25.685,
    description: 'Center latitude for area assignment.',
  })
  @IsNumber()
  latitude!: number;

  @ApiProperty({
    example: -80.312,
    description: 'Center longitude for area assignment.',
  })
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({
    example: 10000,
    minimum: 100,
    description: 'Area assignment radius in meters.',
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  radiusMeters?: number;
}
