import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { HaccpPlan } from '../../haccp-plans/entities/haccp-plan.entity';
import { Hazard } from '../../hazards/entities/hazard.entity';

export enum CcpStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('ccps')
export class Ccp extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', comment: 'Foreign key reference to parent HaccpPlan' })
  planId: string;

  @ManyToOne(() => HaccpPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planId' })
  plan: HaccpPlan;

  @Column({ type: 'uuid', comment: 'Foreign key reference to associated Hazard' })
  hazardId: string;

  @ManyToOne(() => Hazard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hazardId' })
  hazard: Hazard;

  @Column({ type: 'varchar', length: 50, comment: 'CCP Code identifier (e.g. CCP-01, CCP-02)' })
  code: string;

  @Column({ type: 'varchar', length: 255, comment: 'CCP display name (e.g. Cold Storage Temp Monitoring)' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Operational description' })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Minimum critical limit threshold' })
  criticalLimitMin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Maximum critical limit threshold' })
  criticalLimitMax?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Minimum warning/action limit threshold' })
  warningLimitMin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Maximum warning/action limit threshold' })
  warningLimitMax?: number;

  @Column({ type: 'varchar', length: 50, default: '°C', comment: 'Measurement unit (e.g. °C, pH, ppm, bar)' })
  unit: string;

  @Column({ type: 'varchar', length: 255, comment: 'Monitoring procedure / method' })
  monitoringMethod: string;

  @Column({ type: 'varchar', length: 100, comment: 'Monitoring frequency (e.g. Continuous, Every 2 hours)' })
  monitoringFrequency: string;

  @Column({
    type: 'enum',
    enum: CcpStatus,
    default: CcpStatus.ACTIVE,
    comment: 'Status: ACTIVE or INACTIVE',
  })
  status: CcpStatus;
}
