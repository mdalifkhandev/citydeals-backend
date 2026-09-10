import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'demo.user@citydeals.test',
    description: 'Email used during registration.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'DemoPass123!',
    description: 'Password used during registration.',
  })
  @IsString()
  password!: string;
}
