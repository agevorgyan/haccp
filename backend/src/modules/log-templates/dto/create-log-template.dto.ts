import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LogTemplateStatus } from '../entities/log-template.entity';
import { FormFieldSchema } from '../interfaces/form-field-schema.interface';

export class CreateLogTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  ccpId?: string;

  @IsArray()
  @IsNotEmpty()
  fields: FormFieldSchema[];

  @IsOptional()
  @IsEnum(LogTemplateStatus)
  status?: LogTemplateStatus;
}
