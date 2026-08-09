import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CleaningFrequency, CleaningTaskStatus } from '../entities/cleaning-task.entity';

export class UpdateCleaningTaskDto {
  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  equipment?: string;

  @IsOptional()
  @IsString()
  chemical?: string;

  @IsOptional()
  @IsString()
  concentration?: string;

  @IsOptional()
  @IsEnum(CleaningFrequency)
  frequency?: CleaningFrequency;

  @IsOptional()
  @IsString()
  method?: string;

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
