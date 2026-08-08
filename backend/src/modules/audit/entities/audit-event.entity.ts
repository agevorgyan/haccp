import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
}

@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', comment: 'User UUID who performed the action' })
  actor: string;

  @Column({ type: 'varchar', length: 100, comment: 'Action performed (e.g. CREATE, UPDATE, DELETE)' })
  action: string;

  @Column({ type: 'varchar', length: 100, comment: 'Target entity type (e.g. User, Organization)' })
  entity: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Target entity primary key UUID' })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true, comment: 'Pre-change state snapshot' })
  oldValue?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, comment: 'Post-change state snapshot' })
  newValue?: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'IP address of client' })
  ip?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'User-Agent header of client' })
  userAgent?: string;

  @CreateDateColumn({ type: 'timestamptz', comment: 'Immutable timestamp when audit event occurred' })
  timestamp: Date;
}
