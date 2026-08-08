import { IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TranslationEntryDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

export class BulkTranslationDto {
  @IsNotEmpty({ message: 'Language code is required' })
  @IsString()
  languageCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationEntryDto)
  translations: TranslationEntryDto[];
}
