import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogTemplatesTable1786228012349 implements MigrationInterface {
  name = 'CreateLogTemplatesTable1786228012349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."log_templates_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Ensure log_templates columns match updated entity
    await queryRunner.query(`ALTER TABLE "log_templates" DROP COLUMN IF EXISTS "schema"`);
    await queryRunner.query(`ALTER TABLE "log_templates" DROP COLUMN IF EXISTS "title"`);
    await queryRunner.query(`ALTER TABLE "log_templates" DROP COLUMN IF EXISTS "frequency"`);

    await queryRunner.query(`ALTER TABLE "log_templates" ADD COLUMN IF NOT EXISTS "organizationId" uuid`);
    await queryRunner.query(`ALTER TABLE "log_templates" ADD COLUMN IF NOT EXISTS "branchId" uuid`);
    await queryRunner.query(`ALTER TABLE "log_templates" ADD COLUMN IF NOT EXISTS "ccpId" uuid`);
    await queryRunner.query(`ALTER TABLE "log_templates" ADD COLUMN IF NOT EXISTS "name" character varying(255) NOT NULL DEFAULT 'HACCP Task Check'`);
    await queryRunner.query(`ALTER TABLE "log_templates" ADD COLUMN IF NOT EXISTS "fields" jsonb NOT NULL DEFAULT '[]'`);
    await queryRunner.query(`ALTER TABLE "log_templates" ADD COLUMN IF NOT EXISTS "status" "public"."log_templates_status_enum" NOT NULL DEFAULT 'DRAFT'`);
    await queryRunner.query(`ALTER TABLE "log_templates" ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1`);

    // Add FK to ccps table
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "log_templates" ADD CONSTRAINT "FK_log_templates_ccpId" FOREIGN KEY ("ccpId") REFERENCES "ccps"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "log_templates" DROP CONSTRAINT IF EXISTS "FK_log_templates_ccpId"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."log_templates_status_enum"`);
  }
}
