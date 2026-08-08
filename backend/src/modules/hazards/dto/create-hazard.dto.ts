import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { HazardCategory } from '../entities/hazard.entity';

export class CreateHazardDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsOptional()
  @IsUUID()
  processStepId?: string;

  @IsEnum(HazardCategory)
  category: HazardCategory;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  preventiveMeasures?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  severity: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  likelihood: number;
}
