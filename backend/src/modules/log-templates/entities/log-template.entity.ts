import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Ccp } from '../../ccps/entities/ccp.entity';
import { LogEntry } from '../../log-entries/entities/log-entry.entity';
import { FormFieldSchema } from '../interfaces/form-field-schema.interface';

export enum LogTemplateStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('log_templates')
export class LogTemplate extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Target branch ID if location-specific' })
  branchId?: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to associated CCP' })
  ccpId?: string;

  @ManyToOne(() => Ccp, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ccpId' })
  ccp?: Ccp;

  @Column({ type: 'varchar', length: 255, comment: 'Title/name of the HACCP check (e.g. Fridge Temp Check)' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Operational guidance & instructions for kitchen staff' })
  description?: string;

  @Column({
    type: 'jsonb',
    comment: 'JSONB array defining form fields (type, label, min, max, unit, options)',
  })
  fields: FormFieldSchema[];

  @Column({
    type: 'enum',
    enum: LogTemplateStatus,
    default: LogTemplateStatus.DRAFT,
    comment: 'Status: DRAFT, ACTIVE, or ARCHIVED',
  })
  status: LogTemplateStatus;

  @Column({ type: 'integer', default: 1, comment: 'Sequential template version number (e.g. 1, 2, 3)' })
  version: number;

  @ManyToOne(() => Organization, (organization) => organization.logTemplates, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @OneToMany(() => LogEntry, (logEntry) => logEntry.template)
  logEntries: LogEntry[];
}
