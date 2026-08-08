import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { HazardCategory } from '../entities/hazard.entity';

export class UpdateHazardDto {
  @IsOptional()
  @IsUUID()
  processStepId?: string;

  @IsOptional()
  @IsEnum(HazardCategory)
  category?: HazardCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  preventiveMeasures?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  severity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  likelihood?: number;
}
