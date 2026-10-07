import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'Liam Carter' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'liam@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: 'Coupon redemption issue' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'My app is not working...', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  message!: string;
}

