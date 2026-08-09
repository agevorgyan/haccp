import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CleaningFrequency, CleaningTaskStatus } from '../entities/cleaning-task.entity';

export class CreateCleaningTaskDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsOptional()
  @IsString()
  equipment?: string;

  @IsString()
  @IsNotEmpty()
  chemical: string;

  @IsOptional()
  @IsString()
  concentration?: string;

  @IsEnum(CleaningFrequency)
  frequency: CleaningFrequency;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsOptional()
  @IsString()
  responsibleRole?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(CleaningTaskStatus)
  status?: CleaningTaskStatus;
}
