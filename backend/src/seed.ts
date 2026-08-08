import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from './modules/organizations/entities/organization.entity';
import { Branch } from './modules/branches/entities/branch.entity';
import { User, UserRole } from './modules/users/entities/user.entity';
import { LogTemplate, LogTemplateStatus } from './modules/log-templates/entities/log-template.entity';
import { FormFieldType } from './modules/log-templates/interfaces/form-field-schema.interface';
import { LogEntry, LogEntryStatus } from './modules/log-entries/entities/log-entry.entity';

/**
 * Standalone Database Seeder Script
 * Connects to TypeORM PostgreSQL database and inserts initial test data.
 * Clears existing data with CASCADE to handle duplicate constraints gracefully on repeated executions.
 */
async function seed() {
  console.log('🌱 Initializing NestJS application context for database seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const userRepo = queryRunner.manager.getRepository(User);
    const orgRepo = queryRunner.manager.getRepository(Organization);
    const branchRepo = queryRunner.manager.getRepository(Branch);
    const templateRepo = queryRunner.manager.getRepository(LogTemplate);

    console.log('🧹 Clearing existing data to prevent unique constraint violations...');
    // We clear in reverse order of foreign keys
    await queryRunner.query('TRUNCATE TABLE "log_entries", "log_templates", "ccps", "hazards", "haccp_plans", "users", "branches", "organizations" CASCADE');

    // 1. Create Organization
    console.log('🏢 Creating Organization: "Test Cafe LLC"...');
    const org = orgRepo.create({
      name: 'Test Cafe LLC',
    });
    await queryRunner.manager.save(org);

    // 2. Create Branch
    console.log('📍 Creating Branch: "Downtown Branch"...');
    const branch = branchRepo.create({
      name: 'Downtown Branch',
      organization: org,
    });
    await queryRunner.manager.save(branch);

    // 3. Create Users
    console.log('🔐 Hashing PIN/password with bcrypt...');
    const hashedPin = await bcrypt.hash('1234', 10);

    console.log('👤 Creating Manager User (Phone: 099111111)...');
    const managerUser = userRepo.create({
      firstName: 'Arman',
      lastName: 'Manager',
      phone: '099111111',
      passwordHash: hashedPin,
      role: UserRole.MANAGER,
      organization: org,
    });
    await queryRunner.manager.save(managerUser);

    console.log('👨‍🍳 Creating Staff User (Phone: 099222222)...');
    const staffUser = userRepo.create({
      firstName: 'Gevorg',
      lastName: 'Staff',
      phone: '099222222',
      passwordHash: hashedPin,
      role: UserRole.STAFF,
      organization: org,
    });
    await queryRunner.manager.save(staffUser);

    // 4. Create LogTemplate
    console.log('📋 Creating LogTemplate: "Morning Fridge Check"...');
    const logTemplate = templateRepo.create({
      name: 'Morning Fridge Check',
      description: 'Daily morning temperature inspection for kitchen walk-in refrigerators.',
      organizationId: org.id,
      branchId: branch.id,
      status: LogTemplateStatus.ACTIVE,
      version: 1,
      fields: [
        {
          id: 'field-1',
          type: FormFieldType.TEMPERATURE,
          label: 'Walk-In Fridge Temperature',
          required: true,
          unit: '°C',
          min: 0,
          max: 5,
        },
      ],
      organization: org,
    });
    await queryRunner.manager.save(logTemplate);

    // 5. Create Mock Submitted LogEntry
    console.log('📝 Creating Mock Submitted LogEntry...');
    const entryRepo = queryRunner.manager.getRepository(LogEntry);
    const mockEntry = entryRepo.create({
      organizationId: org.id,
      branchId: branch.id,
      templateId: logTemplate.id,
      templateVersion: logTemplate.version,
      userId: staffUser.id,
      timestamp: new Date(),
      shiftId: 'MORNING_SHIFT',
      status: LogEntryStatus.SUBMITTED,
      data: {
        'field-1': 3.2,
      },
      location: 'Main Kitchen Walk-In Fridge',
      device: 'iOS Tablet Terminal',
    });
    await queryRunner.manager.save(mockEntry);

    await queryRunner.commitTransaction();
    console.log('✨ Database Seeding Complete!');
    console.log('----------------------------------------------------');
    console.log('Summary of Created Test Data:');
    console.log(`- Organization : ${org.name} (ID: ${org.id})`);
    console.log(`- Branch       : ${branch.name} (ID: ${branch.id})`);
    console.log(`- Manager User : Phone: 099111111 | PIN: 1234 | Role: MANAGER`);
    console.log(`- Staff User   : Phone: 099222222 | PIN: 1234 | Role: STAFF`);
    console.log(`- Log Template : ${logTemplate.name} (v${logTemplate.version})`);
    console.log(`- Submitted Log: ID: ${mockEntry.id} (temp: 3.2°C, status: SUBMITTED)`);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    await queryRunner.rollbackTransaction();
    process.exitCode = 1;
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

seed();
