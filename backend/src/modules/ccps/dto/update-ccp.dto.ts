import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CcpStatus } from '../entities/ccp.entity';

export class UpdateCcpDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  criticalLimitMin?: number;

  @IsOptional()
  @IsNumber()
  criticalLimitMax?: number;

  @IsOptional()
  @IsNumber()
  warningLimitMin?: number;

  @IsOptional()
  @IsNumber()
  warningLimitMax?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  monitoringMethod?: string;

  @IsOptional()
  @IsString()
  monitoringFrequency?: string;

  @IsOptional()
  @IsEnum(CcpStatus)
  status?: CcpStatus;
}
