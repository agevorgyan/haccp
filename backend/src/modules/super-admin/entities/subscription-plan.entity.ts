import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity {
  @Column({ type: 'varchar', length: 100, comment: 'Plan name (e.g. Starter, Pro, Enterprise)' })
  name: string;

  @Column({ type: 'integer', default: 5, comment: 'Maximum allowed active user accounts' })
  maxUsers: number;

  @Column({ type: 'integer', default: 10, comment: 'Maximum allowed IoT sensors' })
  maxSensors: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00, comment: 'Monthly subscription price in USD' })
  priceMonthly: number;
}
