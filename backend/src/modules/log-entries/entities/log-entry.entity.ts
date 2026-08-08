import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { LogTemplate } from '../../log-templates/entities/log-template.entity';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';

export enum LogEntryStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CORRECTED = 'CORRECTED',
}

@Entity('log_entries')
@Index(['organizationId', 'createdAt'])
@Index(['organizationId', 'status'])
export class LogEntry extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true, comment: 'Target branch ID' })
  branchId?: string;

  @ManyToOne(() => Branch, (branch) => branch.logEntries, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @Column({ type: 'uuid', comment: 'Foreign key reference to LogTemplate' })
  templateId: string;

  @ManyToOne(() => LogTemplate, (template) => template.logEntries, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'templateId' })
  template: LogTemplate;

  @Column({ type: 'integer', default: 1, comment: 'Version number of the LogTemplate at time of entry creation' })
  templateVersion: number;

  @Column({ type: 'uuid', comment: 'Foreign key reference to user who created the entry' })
  userId: string;

  @ManyToOne(() => User, (user) => user.logEntries, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', comment: 'Effective measurement timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Work shift identifier (e.g. Morning, Evening)' })
  shiftId?: string;

  @Column({
    type: 'enum',
    enum: LogEntryStatus,
    default: LogEntryStatus.SUBMITTED,
    comment: 'Immutability lifecycle status: DRAFT, SUBMITTED, or CORRECTED',
  })
  status: LogEntryStatus;

  @Column({
    type: 'jsonb',
    comment: 'PostgreSQL JSONB column storing actual submitted form answers (e.g. { temperature: 3.8, photoUrl: "..." })',
  })
  data: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Physical kitchen location or equipment ID' })
  location?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Device or browser client user-agent info' })
  device?: string;
}
