import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditEventsTable1786227214645 implements MigrationInterface {
  name = 'CreateAuditEventsTable1786227214645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "actor" uuid NOT NULL,
        "action" character varying(100) NOT NULL,
        "entity" character varying(100) NOT NULL,
        "entityId" uuid,
        "oldValue" jsonb,
        "newValue" jsonb,
        "ip" character varying(100),
        "userAgent" character varying(255),
        "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_events_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_events"`);
  }
}
