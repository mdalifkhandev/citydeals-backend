import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  notificationsPaused!: boolean;
}
