import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export enum RegisterRole {
  ADMIN = 'ADMIN',
  ADVERTISER = 'ADVERTISER',
  USER = 'USER',
}

export class RegisterDto {
  @ApiProperty({
    example: 'Demo User',
    description: 'Full name from the create account screen.',
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    example: 'demo.user@citydeals.test',
    description: 'Unique email address for the new user.',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: '+13055550123',
    description: 'Optional phone number from the registration screen.',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.citydeals.test/users/demo-user.jpg',
    description: 'Optional profile picture URL.',
  })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @ApiPropertyOptional({
    example: '1995-05-12T00:00:00.000Z',
    description: 'Optional date of birth from account settings.',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    example: 'DemoPass123!',
    minLength: 8,
    description: 'Password must be at least 8 characters.',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    enum: RegisterRole,
    example: RegisterRole.USER,
    description: 'Use USER for customer testing, ADVERTISER for merchant accounts, ADMIN for admin-only flows.',
  })
  @IsOptional()
  @IsEnum(RegisterRole)
  role?: RegisterRole;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Language selected during onboarding. Use en, es, or pt.',
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({
    example: true,
    description: 'Must be true when the user accepts Terms & Conditions.',
  })
  @IsBoolean()
  acceptedTerms!: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Set true after onboarding screens are completed or skipped.',
  })
  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Initial notification pause preference.',
  })
  @IsOptional()
  @IsBoolean()
  notificationsPaused?: boolean;

  @ApiPropertyOptional({
    description: 'Optional latitude. If provided with longitude, backend tries to assign an area.',
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Optional longitude. Demo value is near Kendall, Florida.',
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
