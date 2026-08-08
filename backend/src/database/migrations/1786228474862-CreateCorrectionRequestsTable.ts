import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCorrectionRequestsTable1786228474862 implements MigrationInterface {
  name = 'CreateCorrectionRequestsTable1786228474862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."correction_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "correction_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "logEntryId" uuid NOT NULL,
        "requestedBy" uuid NOT NULL,
        "reason" text NOT NULL,
        "proposedData" jsonb NOT NULL,
        "status" "public"."correction_requests_status_enum" NOT NULL DEFAULT 'PENDING',
        "reviewedBy" uuid,
        "reviewedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_correction_requests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_correction_requests_logEntryId" FOREIGN KEY ("logEntryId") REFERENCES "log_entries"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_correction_requests_requestedBy" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_correction_requests_reviewedBy" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "correction_requests"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."correction_requests_status_enum"`);
  }
}
