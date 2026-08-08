import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Violation } from '../../violations/entities/violation.entity';
import { User } from '../../users/entities/user.entity';

export enum CapaStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  VERIFICATION = 'VERIFICATION',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

@Entity('corrective_actions')
export class CorrectiveAction extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Target branch ID' })
  branchId?: string;

  @Column({ type: 'uuid', comment: 'Foreign key reference to target Violation' })
  violationId: string;

  @ManyToOne(() => Violation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'violationId' })
  violation: Violation;

  @Column({ type: 'text', comment: 'Detailed description of the CAPA objective' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: 'Root cause analysis findings' })
  rootCause?: string;

  @Column({ type: 'text', comment: 'Immediate action taken to contain the hazard' })
  immediateAction: string;

  @Column({ type: 'text', comment: 'Long-term preventive action to avoid recurrence' })
  preventiveAction: string;

  @Column({ type: 'uuid', comment: 'Foreign key reference to user assigned to execute CAPA' })
  assignedTo: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee?: User;

  @Column({ type: 'timestamptz', comment: 'Mandatory completion deadline timestamp' })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: CapaStatus,
    default: CapaStatus.OPEN,
    comment: 'Lifecycle status: OPEN, ASSIGNED, IN_PROGRESS, PENDING_REVIEW, VERIFICATION, RESOLVED, REJECTED, CLOSED',
  })
  status: CapaStatus;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to manager who approved completion' })
  approvedBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver?: User;
}
