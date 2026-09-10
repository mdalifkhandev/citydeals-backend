import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'DemoPass123!' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'NewDemoPass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ example: 'NewDemoPass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}
