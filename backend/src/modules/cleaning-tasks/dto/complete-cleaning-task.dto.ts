import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CompleteCleaningTaskDto {
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
