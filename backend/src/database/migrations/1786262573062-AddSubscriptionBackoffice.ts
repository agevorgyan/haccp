import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionBackoffice1786262573062 implements MigrationInterface {
    name = 'AddSubscriptionBackoffice1786262573062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(100) NOT NULL, "maxUsers" integer NOT NULL DEFAULT '5', "maxSensors" integer NOT NULL DEFAULT '10', "priceMonthly" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "subscriptionPlanId" uuid`);
        await queryRunner.query(`CREATE TYPE "public"."organizations_subscriptionstatus_enum" AS ENUM('ACTIVE', 'SUSPENDED', 'TRIAL')`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "subscriptionStatus" "public"."organizations_subscriptionstatus_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "FK_organizations_subscriptionPlanId" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_organizations_subscriptionPlanId"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "subscriptionStatus"`);
        await queryRunner.query(`DROP TYPE "public"."organizations_subscriptionstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "subscriptionPlanId"`);
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
    }
}
