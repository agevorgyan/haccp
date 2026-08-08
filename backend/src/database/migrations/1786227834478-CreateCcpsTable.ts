import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCcpsTable1786227834478 implements MigrationInterface {
  name = 'CreateCcpsTable1786227834478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."ccps_status_enum" AS ENUM('ACTIVE', 'INACTIVE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ccps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "planId" uuid NOT NULL,
        "hazardId" uuid NOT NULL,
        "code" character varying(50) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "criticalLimitMin" numeric(10,2),
        "criticalLimitMax" numeric(10,2),
        "warningLimitMin" numeric(10,2),
        "warningLimitMax" numeric(10,2),
        "unit" character varying(50) NOT NULL DEFAULT '°C',
        "monitoringMethod" character varying(255) NOT NULL,
        "monitoringFrequency" character varying(100) NOT NULL,
        "status" "public"."ccps_status_enum" NOT NULL DEFAULT 'ACTIVE',
        CONSTRAINT "PK_ccps_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ccps_planId" FOREIGN KEY ("planId") REFERENCES "haccp_plans"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ccps_hazardId" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "ccps"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."ccps_status_enum"`);
  }
}
