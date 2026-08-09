import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCleaningTasksTable1786258155903 implements MigrationInterface {
  name = 'CreateCleaningTasksTable1786258155903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."cleaning_tasks_frequency_enum" AS ENUM('ONCE', 'HOURLY', 'PER_SHIFT', 'DAILY', 'WEEKLY', 'MONTHLY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."cleaning_tasks_status_enum" AS ENUM('PENDING', 'COMPLETED', 'OVERDUE', 'VERIFIED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cleaning_tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "branchId" uuid,
        "area" character varying(255) NOT NULL,
        "equipment" character varying(255),
        "chemical" character varying(255) NOT NULL,
        "concentration" character varying(100),
        "frequency" "public"."cleaning_tasks_frequency_enum" NOT NULL DEFAULT 'DAILY',
        "method" text NOT NULL,
        "responsibleRole" character varying(100) NOT NULL DEFAULT 'STAFF',
        "assignedTo" uuid,
        "status" "public"."cleaning_tasks_status_enum" NOT NULL DEFAULT 'PENDING',
        "completedAt" TIMESTAMP WITH TIME ZONE,
        "completedBy" uuid,
        "photoUrl" character varying(500),
        "notes" text,
        "verifiedBy" uuid,
        "verifiedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_cleaning_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cleaning_tasks_assignedTo" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cleaning_tasks_completedBy" FOREIGN KEY ("completedBy") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cleaning_tasks_verifiedBy" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cleaning_tasks"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."cleaning_tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."cleaning_tasks_frequency_enum"`);
  }
}
