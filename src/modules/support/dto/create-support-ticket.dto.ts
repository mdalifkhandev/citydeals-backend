import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'Liam Carter' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'liam@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'My app is not working...', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  message!: string;
}
