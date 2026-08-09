import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { LogTemplate } from '../../log-templates/entities/log-template.entity';
import { SubscriptionPlan } from '../../super-admin/entities/subscription-plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
}

/**
 * Organization Entity
 * Represents a B2B HoReCa business tenant (e.g. restaurant chain, hotel group, catering firm).
 */
@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({ type: 'varchar', length: 255, comment: 'Legal or trade name of the HoReCa business' })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'State tax ID / Registration number for invoicing' })
  taxId?: string;

  @Column({ type: 'boolean', default: true, comment: 'SaaS subscription active status' })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to SubscriptionPlan' })
  subscriptionPlanId?: string;

  @ManyToOne(() => SubscriptionPlan, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subscriptionPlanId' })
  subscriptionPlan?: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
    comment: 'Subscription lifecycle status: ACTIVE, SUSPENDED, or TRIAL',
  })
  subscriptionStatus: SubscriptionStatus;

  // Multi-tenant relations
  @OneToMany(() => Branch, (branch) => branch.organization)
  branches: Branch[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => LogTemplate, (template) => template.organization)
  logTemplates: LogTemplate[];
}
