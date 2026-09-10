import { IsString } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  userId!: string;

  @IsString()
  merchantId!: string;

  @IsString()
  title!: string;

  @IsString()
  body!: string;
}
