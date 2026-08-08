import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum ViolationSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ViolationStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('violations')
export class Violation extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Target branch ID' })
  branchId?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'LOG_ENTRY',
    comment: 'Source engine component (e.g. LOG_ENTRY, SENSOR, MANUAL_AUDIT)',
  })
  sourceType: string;

  @Column({ type: 'uuid', comment: 'UUID of the originating log entry or sensor reading' })
  sourceId: string;

  @Column({
    type: 'enum',
    enum: ViolationSeverity,
    default: ViolationSeverity.MEDIUM,
    comment: 'Violation risk severity level: INFO, LOW, MEDIUM, HIGH, CRITICAL',
  })
  severity: ViolationSeverity;

  @Column({ type: 'varchar', length: 255, comment: 'Breached rule or CCP limit identifier' })
  rule: string;

  @Column({ type: 'varchar', length: 255, comment: 'Observed/submitted actual measurement string' })
  actualValue: string;

  @Column({ type: 'varchar', length: 255, comment: 'Expected compliant threshold range string' })
  expectedValue: string;

  @Column({
    type: 'enum',
    enum: ViolationStatus,
    default: ViolationStatus.OPEN,
    comment: 'Resolution status: OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED',
  })
  status: ViolationStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', comment: 'Detection timestamp' })
  detectedAt: Date;

  @Column({ type: 'uuid', nullable: true, comment: 'User UUID assigned to resolve violation' })
  assignedTo?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee?: User;
}
