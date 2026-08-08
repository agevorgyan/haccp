import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateLanguageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
