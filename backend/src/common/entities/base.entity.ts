import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * BaseEntity Abstract Class
 * 
 * Provides standard primary key (UUID v4) and timestamp metadata columns for all database models.
 * 
 * Architectural Highlights:
 * 1. UUID v4 Primary Keys: Prevents ID enumeration attacks and facilitates distributed multi-tenant horizontal scaling.
 * 2. Soft Deletion (`deletedAt`): Food safety regulations (HACCP/FDA) require audit trails. Soft deletion ensures
 *    data can be restored and audit trails remain immutable even if an entry is removed from active UI.
 * 3. Timezone-Aware Timestamps (`timestamptz`): Crucial for multi-branch restaurant chains operating across timezones.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamptz',
    comment: 'Timestamp when the record was created',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    comment: 'Timestamp when the record was last modified',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
    comment: 'Soft delete timestamp for HACCP compliance audit trails',
  })
  deletedAt?: Date;
}
