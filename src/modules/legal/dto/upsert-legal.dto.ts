import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertLegalDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  version?: string;
}
