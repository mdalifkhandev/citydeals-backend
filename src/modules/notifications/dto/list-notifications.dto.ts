import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsNumberString, IsOptional } from 'class-validator';

export class ListNotificationsDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ example: 'false', description: 'Use true/false to filter read state.' })
  @IsOptional()
  @IsBooleanString()
  read?: string;
}
