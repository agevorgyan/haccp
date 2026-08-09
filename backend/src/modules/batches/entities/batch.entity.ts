import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { ReceivingLog } from '../../receiving/entities/receiving-log.entity';

export enum BatchStatus {
  ACTIVE = 'ACTIVE',
  QUARANTINED = 'QUARANTINED',
  EXHAUSTED = 'EXHAUSTED',
  RECALLED = 'RECALLED',
}

@Entity('batches')
export class Batch extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Tenant organization ID' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Target branch ID' })
  branchId?: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to Supplier' })
  supplierId?: string;

  @ManyToOne(() => Supplier, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier?: Supplier;

  @Column({ type: 'uuid', nullable: true, comment: 'Foreign key reference to ReceivingLog' })
  receivingLogId?: string;

  @ManyToOne(() => ReceivingLog, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'receivingLogId' })
  receivingLog?: ReceivingLog;

  @Column({ type: 'varchar', length: 255, comment: 'Ingredient or finished product display name' })
  productName: string;

  @Column({ type: 'varchar', length: 100, comment: 'Traceability lot / batch identifier' })
  batchNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Initial received/manufactured quantity amount' })
  initialQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Current remaining inventory quantity amount' })
  currentQuantity: number;

  @Column({ type: 'varchar', length: 50, comment: 'Measurement unit (e.g. kg, cases, liters, units)' })
  unit: string;

  @Column({ type: 'date', nullable: true, comment: 'Production / packaging date' })
  productionDate?: Date;

  @Column({ type: 'date', comment: 'Product expiration date' })
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.ACTIVE,
    comment: 'Status: ACTIVE, QUARANTINED, EXHAUSTED, RECALLED',
  })
  status: BatchStatus;
}
