import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTranslationColumn1786260320748 implements MigrationInterface {
  name = 'FixTranslationColumn1786260320748';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Foreign key constraint verification between translations and languages
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_translations_languageCode'
        ) THEN
          ALTER TABLE "translations"
          ADD CONSTRAINT "FK_translations_languageCode"
          FOREIGN KEY ("languageCode") REFERENCES "languages"("code") ON DELETE CASCADE;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "translations" DROP CONSTRAINT IF EXISTS "FK_translations_languageCode"
    `);
  }
}
