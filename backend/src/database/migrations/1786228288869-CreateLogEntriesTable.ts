import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogEntriesTable1786228288869 implements MigrationInterface {
  name = 'CreateLogEntriesTable1786228288869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old status column and type to update enum values cleanly
    await queryRunner.query(`ALTER TABLE "log_entries" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."log_entries_status_enum" CASCADE`);

    await queryRunner.query(`
      CREATE TYPE "public"."log_entries_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'CORRECTED');
    `);

    // Ensure log_entries columns match updated entity
    await queryRunner.query(`ALTER TABLE "log_entries" DROP COLUMN IF EXISTS "values"`);
    await queryRunner.query(`ALTER TABLE "log_entries" DROP COLUMN IF EXISTS "notes"`);
    await queryRunner.query(`ALTER TABLE "log_entries" DROP COLUMN IF EXISTS "filled_by_id"`);

    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "organizationId" uuid`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "branchId" uuid`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "templateId" uuid`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "templateVersion" integer NOT NULL DEFAULT 1`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "shiftId" character varying(100)`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "data" jsonb NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "location" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN IF NOT EXISTS "device" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "log_entries" ADD COLUMN "status" "public"."log_entries_status_enum" NOT NULL DEFAULT 'SUBMITTED'`);

    // Add foreign key constraints
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "log_entries" ADD CONSTRAINT "FK_log_entries_templateId" FOREIGN KEY ("templateId") REFERENCES "log_templates"("id") ON DELETE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "log_entries" ADD CONSTRAINT "FK_log_entries_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "log_entries" DROP CONSTRAINT IF EXISTS "FK_log_entries_userId"`);
    await queryRunner.query(`ALTER TABLE "log_entries" DROP CONSTRAINT IF EXISTS "FK_log_entries_templateId"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."log_entries_status_enum" CASCADE`);
  }
}
