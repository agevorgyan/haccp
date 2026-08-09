import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBatchesTable1786259054945 implements MigrationInterface {
  name = 'CreateBatchesTable1786259054945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."batches_status_enum" AS ENUM('ACTIVE', 'QUARANTINED', 'EXHAUSTED', 'RECALLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "batches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "branchId" uuid,
        "supplierId" uuid,
        "receivingLogId" uuid,
        "productName" character varying(255) NOT NULL,
        "batchNumber" character varying(100) NOT NULL,
        "initialQuantity" numeric(10,2) NOT NULL,
        "currentQuantity" numeric(10,2) NOT NULL,
        "unit" character varying(50) NOT NULL,
        "productionDate" date,
        "expiryDate" date NOT NULL,
        "status" "public"."batches_status_enum" NOT NULL DEFAULT 'ACTIVE',
        CONSTRAINT "PK_batches_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_batches_supplierId" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_batches_receivingLogId" FOREIGN KEY ("receivingLogId") REFERENCES "receiving_logs"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "batches"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."batches_status_enum"`);
  }
}
