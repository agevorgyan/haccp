import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('push_subscriptions')
export class PushSubscription extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Target user ID' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'jsonb', comment: 'Web Push subscription JSON object (endpoint and keys)' })
  subscriptionData: Record<string, any>;
}
