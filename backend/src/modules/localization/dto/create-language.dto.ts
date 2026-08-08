import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateLanguageDto {
  @IsNotEmpty({ message: 'Language code is required' })
  @IsString()
  @Length(2, 10, { message: 'Language code must be between 2 and 10 characters' })
  code: string;

  @IsNotEmpty({ message: 'Language name is required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
