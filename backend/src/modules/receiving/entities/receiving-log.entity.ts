import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';

export enum PackagingCondition {
  INTACT = 'INTACT',
  DAMAGED = 'DAMAGED',
  COMPROMISED = 'COMPROMISED',
}

export enum ReceivingStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('receiving_logs')
export class ReceivingLog extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Target branch ID' })
  branchId?: string;

  @Column({ type: 'uuid', comment: 'Foreign key reference to Supplier' })
  supplierId: string;

  @ManyToOne(() => Supplier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'uuid', comment: 'Foreign key reference to user receiving delivery' })
  receivedBy: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'receivedBy' })
  receiver?: User;

  @Column({ type: 'varchar', length: 255, comment: 'Product item display name' })
  productName: string;

  @Column({ type: 'varchar', length: 100, comment: 'Batch / Lot number for traceability' })
  batchNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Delivered quantity amount' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, comment: 'Measurement unit (e.g. kg, cases, liters, boxes)' })
  unit: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Cold chain delivery temperature measurement in °C' })
  temperature?: number;

  @Column({
    type: 'enum',
    enum: PackagingCondition,
    default: PackagingCondition.INTACT,
    comment: 'Packaging condition: INTACT, DAMAGED, COMPROMISED',
  })
  packagingCondition: PackagingCondition;

  @Column({ type: 'date', comment: 'Product expiry / best before date' })
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: ReceivingStatus,
    default: ReceivingStatus.ACCEPTED,
    comment: 'Delivery inspection outcome: ACCEPTED or REJECTED',
  })
  status: ReceivingStatus;

  @Column({ type: 'text', nullable: true, comment: 'Mandatory reason explaining delivery rejection' })
  rejectionReason?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: 'Photo evidence URL of rejected/damaged goods' })
  photoUrl?: string;
}
