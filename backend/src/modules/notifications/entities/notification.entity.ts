import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  ALERT = 'ALERT',
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ type: 'uuid', comment: 'Target user ID' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255, comment: 'Title of the notification' })
  title: string;

  @Column({ type: 'text', comment: 'Detailed message content' })
  message: string;

  @Column({ type: 'boolean', default: false, comment: 'Read status' })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
    comment: 'Type category of notification',
  })
  type: NotificationType;
}
