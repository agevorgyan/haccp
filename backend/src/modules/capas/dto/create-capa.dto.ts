import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CapaStatus } from '../entities/corrective-action.entity';

export class CreateCapaDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsUUID()
  @IsNotEmpty()
  violationId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsString()
  @IsNotEmpty()
  immediateAction: string;

  @IsString()
  @IsNotEmpty()
  preventiveAction: string;

  @IsUUID()
  @IsNotEmpty()
  assignedTo: string;

  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @IsOptional()
  @IsEnum(CapaStatus)
  status?: CapaStatus;
}
