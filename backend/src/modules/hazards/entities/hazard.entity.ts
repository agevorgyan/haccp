import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { HaccpPlan } from '../../haccp-plans/entities/haccp-plan.entity';

export enum HazardCategory {
  BIOLOGICAL = 'BIOLOGICAL',
  CHEMICAL = 'CHEMICAL',
  PHYSICAL = 'PHYSICAL',
  ALLERGEN = 'ALLERGEN',
}

@Entity('hazards')
export class Hazard extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', comment: 'Foreign key reference to parent HaccpPlan' })
  planId: string;

  @ManyToOne(() => HaccpPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planId' })
  plan: HaccpPlan;

  @Column({ type: 'uuid', nullable: true, comment: 'Process step ID if associated with a specific workflow step' })
  processStepId?: string;

  @Column({
    type: 'enum',
    enum: HazardCategory,
    comment: 'Category: BIOLOGICAL, CHEMICAL, PHYSICAL, or ALLERGEN',
  })
  category: HazardCategory;

  @Column({ type: 'text', comment: 'Detailed description of potential hazard' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Origin or source of contamination/risk' })
  source?: string;

  @Column({ type: 'text', nullable: true, comment: 'Preventive or control measures' })
  preventiveMeasures?: string;

  @Column({ type: 'integer', comment: 'Severity score (1 = Minor, 5 = Catastrophic)' })
  severity: number;

  @Column({ type: 'integer', comment: 'Likelihood score (1 = Rare, 5 = Almost Certain)' })
  likelihood: number;

  @Column({ type: 'integer', comment: 'Calculated risk score (Likelihood × Severity)' })
  riskScore: number;

  @Column({ type: 'boolean', default: false, comment: 'Flag indicating significant hazard (riskScore >= 10)' })
  isSignificant: boolean;

  @Column({ type: 'boolean', default: false, comment: 'Flag indicating hazard requires Critical Control Point (CCP)' })
  requiresCCP: boolean;
}
