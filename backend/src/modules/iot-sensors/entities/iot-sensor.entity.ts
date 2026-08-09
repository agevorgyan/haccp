import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Ccp } from '../../ccps/entities/ccp.entity';
import { SensorTelemetry } from './sensor-telemetry.entity';

export enum SensorType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
}

export enum SensorStatus {
  ACTIVE = 'ACTIVE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('iot_sensors')
export class IoTSensor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'branch_id', nullable: true })
  branchId: string;

  @Column({ name: 'sensor_code', unique: true })
  sensorCode: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SensorType,
    default: SensorType.TEMPERATURE,
  })
  type: SensorType;

  @Column({ name: 'ccp_id', nullable: true })
  ccpId: string;

  @ManyToOne(() => Ccp, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ccp_id' })
  ccp: Ccp;

  @Column({
    type: 'enum',
    enum: SensorStatus,
    default: SensorStatus.ACTIVE,
  })
  status: SensorStatus;

  @Column({ name: 'battery_level', type: 'integer', default: 100 })
  batteryLevel: number;

  @Column({ name: 'last_ping_at', type: 'timestamptz', nullable: true })
  lastPingAt: Date;

  @OneToMany(() => SensorTelemetry, (telemetry) => telemetry.sensor)
  telemetryReadings: SensorTelemetry[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
