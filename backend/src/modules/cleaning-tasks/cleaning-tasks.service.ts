import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CleaningTask, CleaningTaskStatus } from './entities/cleaning-task.entity';
import { CreateCleaningTaskDto } from './dto/create-cleaning-task.dto';
import { UpdateCleaningTaskDto } from './dto/update-cleaning-task.dto';
import { CompleteCleaningTaskDto } from './dto/complete-cleaning-task.dto';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class CleaningTasksService {
  constructor(
    @InjectRepository(CleaningTask)
    private readonly cleaningTaskRepository: Repository<CleaningTask>,
  ) {}

  /**
   * Retrieve all cleaning tasks for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<CleaningTask[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.cleaningTaskRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['assignee', 'completer', 'verifier'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.cleaningTaskRepository.find({
      relations: ['assignee', 'completer', 'verifier'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find specific cleaning task by ID with tenant boundary checks
   */
  async findById(id: string, tenant: TenantContext): Promise<CleaningTask> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const task = await this.cleaningTaskRepository.findOne({
      where: whereCondition,
      relations: ['assignee', 'completer', 'verifier'],
    });

    if (!task) {
      throw new NotFoundException(`Cleaning Task with ID "${id}" not found or unauthorized.`);
    }

    return task;
  }

  /**
   * Create a new facility cleaning schedule task
   */
  async create(dto: CreateCleaningTaskDto, tenant: TenantContext): Promise<CleaningTask> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to schedule a cleaning task.');
    }

    const task = this.cleaningTaskRepository.create({
      organizationId: tenant.organizationId,
      branchId: dto.branchId || tenant.branchId,
      area: dto.area,
      equipment: dto.equipment,
      chemical: dto.chemical,
      concentration: dto.concentration,
      frequency: dto.frequency,
      method: dto.method,
      responsibleRole: dto.responsibleRole || 'STAFF',
      assignedTo: dto.assignedTo,
      status: dto.status || CleaningTaskStatus.PENDING,
    });

    return this.cleaningTaskRepository.save(task);
  }

  /**
   * Update cleaning task parameters
   */
  async update(
    id: string,
    dto: UpdateCleaningTaskDto,
    tenant: TenantContext,
  ): Promise<CleaningTask> {
    const task = await this.findById(id, tenant);

    if (dto.area) task.area = dto.area;
    if (dto.equipment !== undefined) task.equipment = dto.equipment;
    if (dto.chemical) task.chemical = dto.chemical;
    if (dto.concentration !== undefined) task.concentration = dto.concentration;
    if (dto.frequency) task.frequency = dto.frequency;
    if (dto.method) task.method = dto.method;
    if (dto.responsibleRole) task.responsibleRole = dto.responsibleRole;
    if (dto.assignedTo !== undefined) task.assignedTo = dto.assignedTo;
    if (dto.status) task.status = dto.status;

    return this.cleaningTaskRepository.save(task);
  }

  /**
   * Complete a cleaning task with photo evidence and notes
   */
  async completeTask(
    id: string,
    dto: CompleteCleaningTaskDto,
    tenant: TenantContext,
  ): Promise<CleaningTask> {
    const task = await this.findById(id, tenant);

    task.status = CleaningTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.completedBy = tenant.userId;
    if (dto.photoUrl !== undefined) task.photoUrl = dto.photoUrl;
    if (dto.notes !== undefined) task.notes = dto.notes;

    return this.cleaningTaskRepository.save(task);
  }

  /**
   * Verify a completed cleaning task (Manager/Owner role)
   */
  async verifyTask(id: string, tenant: TenantContext): Promise<CleaningTask> {
    const task = await this.findById(id, tenant);

    if (task.status !== CleaningTaskStatus.COMPLETED) {
      throw new BadRequestException(
        `Cleaning Task "${id}" is in ${task.status} status and must be COMPLETED before verification.`,
      );
    }

    task.status = CleaningTaskStatus.VERIFIED;
    task.verifiedBy = tenant.userId;
    task.verifiedAt = new Date();

    return this.cleaningTaskRepository.save(task);
  }

  /**
   * Remove a cleaning task entry
   */
  async remove(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const task = await this.findById(id, tenant);
    await this.cleaningTaskRepository.remove(task);
    return { success: true, id };
  }
}
