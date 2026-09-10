import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Liam Carter' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+1123123123' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://cdn.citydeals.test/users/liam.jpg' })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @ApiPropertyOptional({ example: '1995-05-12T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
