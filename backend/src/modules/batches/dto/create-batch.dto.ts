import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BatchStatus } from '../entities/batch.entity';

export class CreateBatchDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsUUID()
  receivingLogId?: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @IsNumber()
  @IsNotEmpty()
  initialQuantity: number;

  @IsOptional()
  @IsNumber()
  currentQuantity?: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsOptional()
  @IsDateString()
  productionDate?: string;

  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;
}
