import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Translation } from './translation.entity';

/**
 * Language Entity
 * Represents supported languages in the system (e.g. English, Armenian, Russian).
 */
@Entity('languages')
export class Language extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 10, comment: 'ISO language code (e.g. en, am, ru, es)' })
  code: string;

  @Column({ type: 'varchar', length: 100, comment: 'Native language name (e.g. English, Հայերեն)' })
  name: string;

  @Column({ type: 'boolean', default: false, comment: 'Flag indicating if language is the application default' })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true, comment: 'Active status indicator' })
  isActive: boolean;

  @OneToMany(() => Translation, (translation) => translation.language, { cascade: true })
  translations: Translation[];
}
