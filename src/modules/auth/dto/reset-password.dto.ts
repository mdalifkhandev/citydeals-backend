import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'admin@citydeals.test',
    description: 'Email registered with the account.',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit verification code.',
  })
  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits.' })
  otp!: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    minLength: 6,
    description: 'New password for the account.',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  newPassword!: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    minLength: 6,
    description: 'Confirm new password.',
  })
  @IsString()
  @MinLength(6, { message: 'Confirm password must be at least 6 characters long.' })
  confirmPassword!: string;
}
