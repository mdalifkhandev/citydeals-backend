import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateLanguageDto {
  @ApiProperty({ example: 'en', enum: ['en', 'es', 'pt'] })
  @IsIn(['en', 'es', 'pt'])
  preferredLanguage!: string;
}
