import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { LogEntry } from '../../log-entries/entities/log-entry.entity';

export enum LogFrequency {
  DAILY = 'DAILY',
  SHIFT = 'SHIFT',
  WEEKLY = 'WEEKLY',
}

/**
 * LogTemplate Entity
 * Dynamic HACCP task definition defining expected fields, safe ranges, and compliance frequencies.
 */
@Entity('log_templates')
export class LogTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 255, comment: 'Title of the HACCP check (e.g. Fridge Temp Check)' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: 'Operational guidance & compliance rules for kitchen staff' })
  description?: string;

  @Column({
    type: 'enum',
    enum: LogFrequency,
    default: LogFrequency.DAILY,
    comment: 'Schedule frequency: DAILY, SHIFT, or WEEKLY',
  })
  frequency: LogFrequency;

  @Column({
    type: 'jsonb',
    comment: 'PostgreSQL JSONB schema defining expected fields (min/max temp, photo required, CCP code)',
  })
  schema: Record<string, any>;

  // Many Log Templates belong to an Organization
  @ManyToOne(() => Organization, (organization) => organization.logTemplates, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // One Log Template has many filled log entries
  @OneToMany(() => LogEntry, (logEntry) => logEntry.template)
  logEntries: LogEntry[];
}
