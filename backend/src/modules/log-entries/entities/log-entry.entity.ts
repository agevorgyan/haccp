import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { LogTemplate } from '../../log-templates/entities/log-template.entity';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';

export enum LogStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

/**
 * LogEntry Entity
 * Immutable audit record representing filled HACCP logs submitted by kitchen staff.
 */
@Entity('log_entries')
@Index(['organizationId', 'createdAt']) // Composite index for ultra-fast multi-tenant time-range queries
@Index(['organizationId', 'status'])   // Composite index for audit alerts & compliance filtering
export class LogEntry extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Direct tenant reference for strict multi-tenant database isolation' })
  organizationId: string;

  // Direct relationship to Tenant Organization
  @ManyToOne(() => Organization, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({
    type: 'jsonb',
    comment: 'PostgreSQL JSONB column storing actual submitted log data (e.g. { temperature: 3.8, photoUrl: "..." })',
  })
  data: Record<string, any>;

  @Column({
    type: 'enum',
    enum: LogStatus,
    default: LogStatus.OK,
    comment: 'Compliance status result: OK, WARNING, or CRITICAL',
  })
  status: LogStatus;

  // Many Log Entries belong to one Log Template
  @ManyToOne(() => LogTemplate, (template) => template.logEntries, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'template_id' })
  template: LogTemplate;

  // Many Log Entries are filled by one User (staff member)
  @ManyToOne(() => User, (user) => user.logEntries, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'filled_by_id' })
  filledBy?: User;

  // Many Log Entries belong to one Branch (venue location)
  @ManyToOne(() => Branch, (branch) => branch.logEntries, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
