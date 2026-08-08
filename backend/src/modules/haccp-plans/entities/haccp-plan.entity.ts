import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum HaccpPlanStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('haccp_plans')
export class HaccpPlan extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Target branch ID if location-specific' })
  branchId?: string;

  @Column({ type: 'varchar', length: 255, comment: 'HACCP plan display name (e.g. Master Food Safety Plan)' })
  name: string;

  @Column({ type: 'integer', default: 1, comment: 'Sequential plan version number (e.g. 1, 2, 3)' })
  version: number;

  @Column({
    type: 'enum',
    enum: HaccpPlanStatus,
    default: HaccpPlanStatus.DRAFT,
    comment: 'Lifecycle status: DRAFT, IN_REVIEW, APPROVED, ACTIVE, or ARCHIVED',
  })
  status: HaccpPlanStatus;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Date when plan becomes legally effective' })
  effectiveFrom?: Date;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Date when plan expires or is superseded' })
  effectiveTo?: Date;

  @Column({ type: 'uuid', nullable: true, comment: 'User UUID who approved the plan' })
  approvedBy?: string;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Timestamp when plan was approved' })
  approvedAt?: Date;

  @Column({ type: 'uuid', comment: 'User UUID who created the plan record' })
  createdBy: string;
}
