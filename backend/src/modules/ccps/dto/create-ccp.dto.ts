import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CcpStatus } from '../entities/ccp.entity';

export class CreateCcpDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsUUID()
  @IsNotEmpty()
  hazardId: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

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

  @IsString()
  @IsNotEmpty()
  monitoringMethod: string;

  @IsString()
  @IsNotEmpty()
  monitoringFrequency: string;

  @IsOptional()
  @IsEnum(CcpStatus)
  status?: CcpStatus;
}
