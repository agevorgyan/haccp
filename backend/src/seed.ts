import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from './modules/organizations/entities/organization.entity';
import { Branch } from './modules/branches/entities/branch.entity';
import { User, UserRole } from './modules/users/entities/user.entity';
import { LogTemplate, LogFrequency } from './modules/log-templates/entities/log-template.entity';
import { LogEntry } from './modules/log-entries/entities/log-entry.entity';

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

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🧹 Clearing existing data to prevent unique constraint violations...');
    // Truncate tables in dependency order with CASCADE to support safe repeated execution
    await queryRunner.query('TRUNCATE TABLE log_entries, log_templates, users, branches, organizations CASCADE;');

    const orgRepo = dataSource.getRepository(Organization);
    const branchRepo = dataSource.getRepository(Branch);
    const userRepo = dataSource.getRepository(User);
    const templateRepo = dataSource.getRepository(LogTemplate);

    // 1. Create Organization
    console.log('🏢 Creating Organization: "Test Cafe LLC"...');
    const org = orgRepo.create({
      name: 'Test Cafe LLC',
      taxId: 'US-987654321',
      isActive: true,
    });
    await queryRunner.manager.save(org);

    // 2. Create Branch
    console.log('📍 Creating Branch: "Downtown Branch"...');
    const branch = branchRepo.create({
      name: 'Downtown Branch',
      address: '123 Main Street, Suite 100',
      organization: org,
    });
    await queryRunner.manager.save(branch);

    // 3. Create Users (bcrypt hashed PIN "1234")
    console.log('🔐 Hashing PIN/password with bcrypt...');
    const hashedPin = await bcrypt.hash('1234', 10);

    console.log('👤 Creating Manager User (Phone: 099111111)...');
    const managerUser = userRepo.create({
      firstName: 'Alex',
      lastName: 'Manager',
      phone: '099111111',
      passwordHash: hashedPin,
      role: UserRole.MANAGER,
      organization: org,
    });
    await queryRunner.manager.save(managerUser);

    console.log('👨‍🍳 Creating Staff User (Phone: 099222222)...');
    const staffUser = userRepo.create({
      firstName: 'Sam',
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
      title: 'Morning Fridge Check',
      description: 'Daily morning temperature inspection for kitchen walk-in refrigerators.',
      frequency: LogFrequency.DAILY,
      schema: {
        fields: [
          {
            name: 'temperature',
            label: 'Walk-In Fridge Temperature',
            type: 'number',
            unit: '°C',
            required: true,
            safeRange: { min: 0, max: 5 },
          },
        ],
        equipmentOrArea: 'Main Walk-In Refrigerator',
        ccpCode: 'CCP-1',
      },
      organization: org,
    });
    await queryRunner.manager.save(logTemplate);

    await queryRunner.commitTransaction();
    console.log('✨ Database Seeding Complete!');
    console.log('----------------------------------------------------');
    console.log('Summary of Created Test Data:');
    console.log(`- Organization : ${org.name} (ID: ${org.id})`);
    console.log(`- Branch       : ${branch.name} (ID: ${branch.id})`);
    console.log(`- Manager User : Phone: 099111111 | PIN: 1234 | Role: MANAGER`);
    console.log(`- Staff User   : Phone: 099222222 | PIN: 1234 | Role: STAFF`);
    console.log(`- Log Template : ${logTemplate.title} (CCP-1, range: 0°C to 5°C)`);
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
