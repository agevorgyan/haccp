import {
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ViolationStatus } from '../entities/violation.entity';

export class UpdateViolationStatusDto {
  @IsEnum(ViolationStatus)
  status: ViolationStatus;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
