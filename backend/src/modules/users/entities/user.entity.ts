import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { LogEntry } from '../../log-entries/entities/log-entry.entity';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

/**
 * User Entity
 * Represents staff, kitchen leads, managers, and business owners.
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, comment: 'First name of the user' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, comment: 'Last name of the user' })
  lastName: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: 'Phone number used for OTP/credentials authentication' })
  phone: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    select: false, // Prevents passwordHash from being returned in default TypeORM queries
    comment: 'Bcrypt hashed password' 
  })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF,
    comment: 'Access control role: OWNER, MANAGER, or STAFF',
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 150, nullable: true, comment: 'User email address for notifications' })
  email?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Telegram Chat ID for bot alerts' })
  telegramChatId?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Unique 6-digit code to link Telegram bot account' })
  telegramLinkCode?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: { inApp: true, push: true, email: true, telegram: true },
    comment: 'Multi-channel notification preferences',
  })
  notificationPreferences: {
    inApp: boolean;
    push: boolean;
    email: boolean;
    telegram: boolean;
  };

  // Many Users belong to one Organization
  @ManyToOne(() => Organization, (organization) => organization.users, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // One User (kitchen employee) fills many HACCP log entries
  @OneToMany(() => LogEntry, (logEntry) => logEntry.user)
  logEntries: LogEntry[];
}
