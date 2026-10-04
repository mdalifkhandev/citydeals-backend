import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'admin@citydeals.test',
    description: 'Email registered with the account.',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;
}
