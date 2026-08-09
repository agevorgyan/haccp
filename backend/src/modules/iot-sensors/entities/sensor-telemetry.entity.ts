import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IoTSensor } from './iot-sensor.entity';

@Entity('sensor_telemetry')
export class SensorTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'sensor_id' })
  sensorId: string;

  @ManyToOne(() => IoTSensor, (sensor) => sensor.telemetryReadings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sensor_id' })
  sensor: IoTSensor;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column()
  unit: string;

  @CreateDateColumn({ name: 'timestamp', type: 'timestamptz' })
  timestamp: Date;
}
