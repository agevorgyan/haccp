import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED',
}

export enum SupplierRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255, comment: 'Supplier company name' })
  name: string;

  @Column({ type: 'varchar', length: 255, comment: 'Primary contact person name' })
  contactPerson: string;

  @Column({ type: 'varchar', length: 50, comment: 'Contact phone number' })
  phone: string;

  @Column({ type: 'varchar', length: 255, comment: 'Contact email address' })
  email: string;

  @Column('text', { array: true, default: '{}', comment: 'Supplied food categories (e.g. MEAT, DAIRY, PRODUCE)' })
  categories: string[];

  @Column({ type: 'jsonb', nullable: true, comment: 'JSON array of compliance certificates (HACCP, ISO, Organic)' })
  certificates?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
    comment: 'Status: ACTIVE, INACTIVE, or BLACKLISTED',
  })
  status: SupplierStatus;

  @Column({
    type: 'enum',
    enum: SupplierRiskLevel,
    default: SupplierRiskLevel.LOW,
    comment: 'Evaluated supplier risk level: LOW, MEDIUM, HIGH',
  })
  riskLevel: SupplierRiskLevel;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 5.00,
    comment: 'Supplier quality performance rating score (0.00 to 5.00)',
  })
  rating: number;
}
