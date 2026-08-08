import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHazardsTable1786227676384 implements MigrationInterface {
  name = 'CreateHazardsTable1786227676384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."hazards_category_enum" AS ENUM('BIOLOGICAL', 'CHEMICAL', 'PHYSICAL', 'ALLERGEN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hazards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "planId" uuid NOT NULL,
        "processStepId" uuid,
        "category" "public"."hazards_category_enum" NOT NULL,
        "description" text NOT NULL,
        "source" character varying(255),
        "preventiveMeasures" text,
        "severity" integer NOT NULL,
        "likelihood" integer NOT NULL,
        "riskScore" integer NOT NULL,
        "isSignificant" boolean NOT NULL DEFAULT false,
        "requiresCCP" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_hazards_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_hazards_planId" FOREIGN KEY ("planId") REFERENCES "haccp_plans"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "hazards"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."hazards_category_enum"`);
  }
}
