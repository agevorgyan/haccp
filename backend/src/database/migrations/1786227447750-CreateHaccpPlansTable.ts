import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHaccpPlansTable1786227447750 implements MigrationInterface {
  name = 'CreateHaccpPlansTable1786227447750';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."haccp_plans_status_enum" AS ENUM('DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "haccp_plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "branchId" uuid,
        "name" character varying(255) NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        "status" "public"."haccp_plans_status_enum" NOT NULL DEFAULT 'DRAFT',
        "effectiveFrom" TIMESTAMP WITH TIME ZONE,
        "effectiveTo" TIMESTAMP WITH TIME ZONE,
        "approvedBy" uuid,
        "approvedAt" TIMESTAMP WITH TIME ZONE,
        "createdBy" uuid NOT NULL,
        CONSTRAINT "PK_haccp_plans_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "haccp_plans"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."haccp_plans_status_enum"`);
  }
}
