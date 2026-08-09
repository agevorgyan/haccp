import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PackagingCondition, ReceivingStatus } from '../entities/receiving-log.entity';

export class CreateReceivingLogDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsEnum(PackagingCondition)
  packagingCondition: PackagingCondition;

  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @IsEnum(ReceivingStatus)
  status: ReceivingStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
