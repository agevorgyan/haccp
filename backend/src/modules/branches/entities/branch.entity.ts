import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { LogEntry } from '../../log-entries/entities/log-entry.entity';

/**
 * Branch Entity
 * Represents a physical venue location (e.g., Downtown Bistro, Central Kitchen Facility).
 */
@Entity('branches')
export class Branch extends BaseEntity {
  @Column({ type: 'varchar', length: 255, comment: 'Branch or location display name' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Physical street address' })
  address?: string;

  // Many Branches belong to one Organization
  @ManyToOne(() => Organization, (organization) => organization.branches, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // One Branch has many logged entries
  @OneToMany(() => LogEntry, (logEntry) => logEntry.branch)
  logEntries: LogEntry[];
}
