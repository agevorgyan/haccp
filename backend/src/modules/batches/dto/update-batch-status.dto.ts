import {
  IsEnum,
} from 'class-validator';
import { BatchStatus } from '../entities/batch.entity';

export class UpdateBatchStatusDto {
  @IsEnum(BatchStatus)
  status: BatchStatus;
}
