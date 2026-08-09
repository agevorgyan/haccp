import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSuppliersAndReceivingLogsTables1786258418601 implements MigrationInterface {
  name = 'CreateSuppliersAndReceivingLogsTables1786258418601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."suppliers_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'BLACKLISTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."suppliers_risklevel_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "suppliers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "contactPerson" character varying(255) NOT NULL,
        "phone" character varying(50) NOT NULL,
        "email" character varying(255) NOT NULL,
        "categories" text array NOT NULL DEFAULT '{}',
        "certificates" jsonb,
        "status" "public"."suppliers_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "riskLevel" "public"."suppliers_risklevel_enum" NOT NULL DEFAULT 'LOW',
        "rating" numeric(3,2) NOT NULL DEFAULT '5',
        CONSTRAINT "PK_suppliers_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."receiving_logs_packagingcondition_enum" AS ENUM('INTACT', 'DAMAGED', 'COMPROMISED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."receiving_logs_status_enum" AS ENUM('ACCEPTED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "receiving_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "organizationId" uuid NOT NULL,
        "branchId" uuid,
        "supplierId" uuid NOT NULL,
        "receivedBy" uuid NOT NULL,
        "productName" character varying(255) NOT NULL,
        "batchNumber" character varying(100) NOT NULL,
        "quantity" numeric(10,2) NOT NULL,
        "unit" character varying(50) NOT NULL,
        "temperature" numeric(5,2),
        "packagingCondition" "public"."receiving_logs_packagingcondition_enum" NOT NULL DEFAULT 'INTACT',
        "expiryDate" date NOT NULL,
        "status" "public"."receiving_logs_status_enum" NOT NULL DEFAULT 'ACCEPTED',
        "rejectionReason" text,
        "photoUrl" character varying(500),
        CONSTRAINT "PK_receiving_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_receiving_logs_supplierId" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_receiving_logs_receivedBy" FOREIGN KEY ("receivedBy") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "receiving_logs"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."receiving_logs_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."receiving_logs_packagingcondition_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "suppliers"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."suppliers_risklevel_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."suppliers_status_enum"`);
  }
}
