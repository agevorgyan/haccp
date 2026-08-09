import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum CleaningFrequency {
  ONCE = 'ONCE',
  HOURLY = 'HOURLY',
  PER_SHIFT = 'PER_SHIFT',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum CleaningTaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  VERIFIED = 'VERIFIED',
}

@Entity('cleaning_tasks')
export class CleaningTask extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Target branch ID' })
  branchId?: string;

  @Column({ type: 'varchar', length: 255, comment: 'Facility area to clean (e.g. Kitchen Floor, Prep Station)' })
  area: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Specific equipment unit to sanitize' })
  equipment?: string;

  @Column({ type: 'varchar', length: 255, comment: 'Sanitizing agent / chemical used' })
  chemical: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Chemical concentration ratio (e.g. 200 ppm, 5%)' })
  concentration?: string;

  @Column({
    type: 'enum',
    enum: CleaningFrequency,
    default: CleaningFrequency.DAILY,
    comment: 'Cleaning schedule frequency: ONCE, HOURLY, PER_SHIFT, DAILY, WEEKLY, MONTHLY',
  })
  frequency: CleaningFrequency;

  @Column({ type: 'text', comment: 'Standard operating cleaning method / SOP procedure' })
  method: string;

  @Column({ type: 'varchar', length: 100, default: 'STAFF', comment: 'Role responsible for cleaning task' })
  responsibleRole: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to user assigned to clean' })
  assignedTo?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee?: User;

  @Column({
    type: 'enum',
    enum: CleaningTaskStatus,
    default: CleaningTaskStatus.PENDING,
    comment: 'Status: PENDING, COMPLETED, OVERDUE, or VERIFIED',
  })
  status: CleaningTaskStatus;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Completion timestamp' })
  completedAt?: Date;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to user who performed cleaning' })
  completedBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'completedBy' })
  completer?: User;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: 'Photo evidence URL of completed cleaning' })
  photoUrl?: string;

  @Column({ type: 'text', nullable: true, comment: 'Operational notes / observations during cleaning' })
  notes?: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to manager who verified sanitation' })
  verifiedBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'verifiedBy' })
  verifier?: User;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Verification timestamp' })
  verifiedAt?: Date;
}
