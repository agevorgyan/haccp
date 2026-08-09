import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { SensorType, SensorStatus } from '../entities/iot-sensor.entity';

export class CreateIoTSensorDto {
  @IsString()
  sensorCode: string;

  @IsString()
  name: string;

  @IsEnum(SensorType)
  type: SensorType;

  @IsOptional()
  @IsUUID()
  ccpId?: string;

  @IsOptional()
  @IsEnum(SensorStatus)
  status?: SensorStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
