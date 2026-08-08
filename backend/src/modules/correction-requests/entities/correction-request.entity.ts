import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LogEntry } from '../../log-entries/entities/log-entry.entity';
import { User } from '../../users/entities/user.entity';

export enum CorrectionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('correction_requests')
export class CorrectionRequest extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', comment: 'Foreign key reference to target LogEntry' })
  logEntryId: string;

  @ManyToOne(() => LogEntry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'logEntryId' })
  logEntry: LogEntry;

  @Column({ type: 'uuid', comment: 'Foreign key reference to user who requested correction' })
  requestedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestedBy' })
  requester: User;

  @Column({ type: 'text', comment: 'Compliance justification / reason for correction request' })
  reason: string;

  @Column({
    type: 'jsonb',
    comment: 'Proposed corrected form answers payload',
  })
  proposedData: Record<string, any>;

  @Column({
    type: 'enum',
    enum: CorrectionRequestStatus,
    default: CorrectionRequestStatus.PENDING,
    comment: 'Status: PENDING, APPROVED, or REJECTED',
  })
  status: CorrectionRequestStatus;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to manager who reviewed the request' })
  reviewedBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewedBy' })
  reviewer?: User;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Timestamp when request was reviewed' })
  reviewedAt?: Date;
}
