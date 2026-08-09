import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class IngestTelemetryDto {
  @IsUUID()
  sensorId: string;

  @IsNumber()
  value: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
