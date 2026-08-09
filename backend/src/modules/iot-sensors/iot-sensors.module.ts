import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTSensor } from './entities/iot-sensor.entity';
import { SensorTelemetry } from './entities/sensor-telemetry.entity';
import { IoTSensorsService } from './iot-sensors.service';
import { IoTSensorsController } from './iot-sensors.controller';
import { CcpsModule } from '../ccps/ccps.module';
import { ViolationsModule } from '../violations/violations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IoTSensor, SensorTelemetry]),
    CcpsModule,
    ViolationsModule,
  ],
  controllers: [IoTSensorsController],
  providers: [IoTSensorsService],
  exports: [IoTSensorsService],
})
export class IoTSensorsModule {}
