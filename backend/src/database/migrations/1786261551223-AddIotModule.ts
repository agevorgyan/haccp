import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIotModule1786261551223 implements MigrationInterface {
    name = 'AddIotModule1786261551223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."iot_sensors_type_enum" AS ENUM('TEMPERATURE', 'HUMIDITY')`);
        await queryRunner.query(`CREATE TYPE "public"."iot_sensors_status_enum" AS ENUM('ACTIVE', 'OFFLINE', 'MAINTENANCE')`);
        await queryRunner.query(`CREATE TABLE "iot_sensors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" character varying NOT NULL, "branch_id" character varying, "sensor_code" character varying NOT NULL, "name" character varying NOT NULL, "type" "public"."iot_sensors_type_enum" NOT NULL DEFAULT 'TEMPERATURE', "ccp_id" uuid, "status" "public"."iot_sensors_status_enum" NOT NULL DEFAULT 'ACTIVE', "battery_level" integer NOT NULL DEFAULT '100', "last_ping_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f929361108a46e213ec60419103" UNIQUE ("sensor_code"), CONSTRAINT "PK_20692186d94d9122a1ec92cac3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sensor_telemetry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" character varying NOT NULL, "sensor_id" uuid NOT NULL, "value" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_846aafb1da42c3da8510a4bf703" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "iot_sensors" ADD CONSTRAINT "FK_iot_sensors_ccp_id" FOREIGN KEY ("ccp_id") REFERENCES "ccps"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sensor_telemetry" ADD CONSTRAINT "FK_sensor_telemetry_sensor_id" FOREIGN KEY ("sensor_id") REFERENCES "iot_sensors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sensor_telemetry" DROP CONSTRAINT "FK_sensor_telemetry_sensor_id"`);
        await queryRunner.query(`ALTER TABLE "iot_sensors" DROP CONSTRAINT "FK_iot_sensors_ccp_id"`);
        await queryRunner.query(`DROP TABLE "sensor_telemetry"`);
        await queryRunner.query(`DROP TABLE "iot_sensors"`);
        await queryRunner.query(`DROP TYPE "public"."iot_sensors_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."iot_sensors_type_enum"`);
    }
}
