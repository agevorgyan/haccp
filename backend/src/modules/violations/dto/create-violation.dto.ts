import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ViolationSeverity, ViolationStatus } from '../entities/violation.entity';

export class CreateViolationDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsUUID()
  @IsNotEmpty()
  sourceId: string;

  @IsEnum(ViolationSeverity)
  severity: ViolationSeverity;

  @IsString()
  @IsNotEmpty()
  rule: string;

  @IsString()
  @IsNotEmpty()
  actualValue: string;

  @IsString()
  @IsNotEmpty()
  expectedValue: string;

  @IsOptional()
  @IsEnum(ViolationStatus)
  status?: ViolationStatus;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
