import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'admin@citydeals.test',
    description: 'Email registered with the account.',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit verification code received by the user.',
  })
  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits.' })
  otp!: string;
}
