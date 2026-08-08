import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateViolationsTable1786228751648 implements MigrationInterface {
  name = 'CreateViolationsTable1786228751648';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."violations_severity_enum" AS ENUM('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."violations_status_enum" AS ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "violations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "branchId" uuid,
        "sourceType" character varying(50) NOT NULL DEFAULT 'LOG_ENTRY',
        "sourceId" uuid NOT NULL,
        "severity" "public"."violations_severity_enum" NOT NULL DEFAULT 'MEDIUM',
        "rule" character varying(255) NOT NULL,
        "actualValue" character varying(255) NOT NULL,
        "expectedValue" character varying(255) NOT NULL,
        "status" "public"."violations_status_enum" NOT NULL DEFAULT 'OPEN',
        "detectedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "assignedTo" uuid,
        CONSTRAINT "PK_violations_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_violations_assignedTo" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "violations"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."violations_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."violations_severity_enum"`);
  }
}
