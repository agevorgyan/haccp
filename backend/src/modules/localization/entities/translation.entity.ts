import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Language } from './language.entity';

/**
 * Translation Entity
 * Stores localized key-value translation strings mapped per language code.
 */
@Entity('translations')
@Index(['languageCode', 'key'], { unique: true }) // Composite index for ultra-fast lookup & duplicate protection
export class Translation extends BaseEntity {
  @Column({ type: 'varchar', length: 255, comment: 'Translation key string (e.g. dashboard, auth.login)' })
  key: string;

  @Column({ type: 'text', comment: 'Localized translated text value' })
  value: string;

  @Column({ name: 'languageCode', type: 'varchar', length: 10, comment: 'Target ISO language code' })
  languageCode: string;

  @ManyToOne(() => Language, (language) => language.translations, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'languageCode', referencedColumnName: 'code' })
  language: Language;
}
