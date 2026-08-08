import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { LogEntryStatus } from '../entities/log-entry.entity';

export class CreateLogEntryDto {
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsEnum(LogEntryStatus)
  status?: LogEntryStatus;
}
