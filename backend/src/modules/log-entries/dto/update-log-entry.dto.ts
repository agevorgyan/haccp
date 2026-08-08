import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { LogEntryStatus } from '../entities/log-entry.entity';

export class UpdateLogEntryDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  shiftId?: string;

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
