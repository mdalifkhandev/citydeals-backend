import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateStaffRoleDto {
  @ApiProperty({ example: 'administrator' })
  @IsString()
  roleKey!: string;
}
