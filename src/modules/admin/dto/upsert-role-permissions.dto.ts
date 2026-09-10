import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class UpsertRolePermissionsDto {
  @ApiProperty({ example: 'administrator' })
  @IsString()
  roleKey!: string;

  @ApiProperty({ example: { 'manage-staff-accounts': true, 'publish-coupons': true } })
  @IsObject()
  permissions!: Record<string, boolean>;
}
