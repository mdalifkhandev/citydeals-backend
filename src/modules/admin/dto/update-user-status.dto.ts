import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum AdminUserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: AdminUserStatus, example: AdminUserStatus.SUSPENDED })
  @IsEnum(AdminUserStatus)
  status!: AdminUserStatus;
}
