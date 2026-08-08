import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCorrectiveActionsTable1786228947981 implements MigrationInterface {
  name = 'CreateCorrectiveActionsTable1786228947981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."corrective_actions_status_enum" AS ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'VERIFICATION', 'RESOLVED', 'REJECTED', 'CLOSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "corrective_actions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "branchId" uuid,
        "violationId" uuid NOT NULL,
        "description" text NOT NULL,
        "rootCause" text,
        "immediateAction" text NOT NULL,
        "preventiveAction" text NOT NULL,
        "assignedTo" uuid NOT NULL,
        "deadline" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" "public"."corrective_actions_status_enum" NOT NULL DEFAULT 'OPEN',
        "approvedBy" uuid,
        CONSTRAINT "PK_corrective_actions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_corrective_actions_violationId" FOREIGN KEY ("violationId") REFERENCES "violations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_corrective_actions_assignedTo" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_corrective_actions_approvedBy" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "corrective_actions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."corrective_actions_status_enum"`);
  }
}
