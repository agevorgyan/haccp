import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CapaStatus } from '../entities/corrective-action.entity';

export class UpdateCapaStatusDto {
  @IsEnum(CapaStatus)
  status: CapaStatus;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
