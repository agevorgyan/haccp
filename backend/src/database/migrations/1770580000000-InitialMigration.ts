import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1770580000000 implements MigrationInterface {
  name = 'InitialMigration1770580000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enum Types safely
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
          CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_type_enum') THEN
          CREATE TYPE "public"."notifications_type_enum" AS ENUM('ALERT', 'INFO', 'WARNING', 'CRITICAL');
        END IF;
      END $$;
    `);

    // 2. Organizations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "name" character varying(150) NOT NULL,
        "legalName" character varying(200),
        "taxId" character varying(50),
        "address" character varying(255),
        "phone" character varying(50),
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_organizations_id" PRIMARY KEY ("id")
      )
    `);

    // 3. Branches
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "branches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "name" character varying(150) NOT NULL,
        "address" character varying(255),
        "phone" character varying(50),
        "isActive" boolean NOT NULL DEFAULT true,
        "organization_id" uuid NOT NULL,
        CONSTRAINT "PK_branches_id" PRIMARY KEY ("id")
      )
    `);

    // 4. Users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "phone" character varying(50) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'STAFF',
        "email" character varying(150),
        "telegramChatId" character varying(100),
        "telegramLinkCode" character varying(20),
        "notificationPreferences" jsonb DEFAULT '{"inApp": true, "push": true, "email": true, "telegram": true}',
        "organization_id" uuid NOT NULL,
        CONSTRAINT "UQ_users_phone" UNIQUE ("phone"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // 5. Languages
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "languages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "code" character varying(10) NOT NULL,
        "name" character varying(100) NOT NULL,
        "nativeName" character varying(100) NOT NULL,
        "isDefault" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "flag" character varying(10),
        CONSTRAINT "UQ_languages_code" UNIQUE ("code"),
        CONSTRAINT "PK_languages_id" PRIMARY KEY ("id")
      )
    `);

    // 6. Translations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "translations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "languageCode" character varying(10) NOT NULL,
        "key" character varying(255) NOT NULL,
        "value" text NOT NULL,
        "category" character varying(50) NOT NULL DEFAULT 'general',
        CONSTRAINT "PK_translations_id" PRIMARY KEY ("id")
      )
    `);

    // 7. Log Templates
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "log_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "title" character varying(200) NOT NULL,
        "description" text,
        "frequency" character varying(50) NOT NULL DEFAULT 'DAILY',
        "schema" jsonb NOT NULL,
        "organization_id" uuid,
        CONSTRAINT "PK_log_templates_id" PRIMARY KEY ("id")
      )
    `);

    // 8. Log Entries
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "log_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "values" jsonb NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'COMPLIANT',
        "notes" text,
        "filled_by_id" uuid,
        "template_id" uuid,
        CONSTRAINT "PK_log_entries_id" PRIMARY KEY ("id")
      )
    `);

    // 9. Notifications (Column names match Notification entity: userId, isRead)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "userId" uuid NOT NULL,
        "title" character varying(200) NOT NULL,
        "message" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'ALERT',
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
      )
    `);

    // 10. Push Subscriptions (Column names match PushSubscription entity: userId, subscriptionData)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "push_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "userId" uuid NOT NULL,
        "subscriptionData" jsonb NOT NULL,
        CONSTRAINT "PK_push_subscriptions_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "push_subscriptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "log_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "log_templates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "translations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "languages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "branches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organizations"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
