import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { LogTemplateStatus } from '../entities/log-template.entity';
import { FormFieldSchema } from '../interfaces/form-field-schema.interface';

export class UpdateLogTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  ccpId?: string;

  @IsOptional()
  @IsArray()
  fields?: FormFieldSchema[];

  @IsOptional()
  @IsEnum(LogTemplateStatus)
  status?: LogTemplateStatus;
}
