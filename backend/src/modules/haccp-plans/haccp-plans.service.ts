import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HaccpPlan, HaccpPlanStatus } from './entities/haccp-plan.entity';
import { CreateHaccpPlanDto } from './dto/create-haccp-plan.dto';
import { UpdateHaccpPlanDto } from './dto/update-haccp-plan.dto';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class HaccpPlansService {
  constructor(
    @InjectRepository(HaccpPlan)
    private readonly planRepository: Repository<HaccpPlan>,
  ) {}

  /**
   * List all HACCP plans scoped strictly by tenant organization ID
   */
  async findAll(tenant: TenantContext): Promise<HaccpPlan[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.planRepository.find({
        where: { organizationId: tenant.organizationId },
        order: { version: 'DESC', createdAt: 'DESC' },
      });
    }

    return this.planRepository.find({
      order: { version: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Find specific HACCP plan by ID with tenant organization boundary enforcement
   */
  async findById(id: string, tenant: TenantContext): Promise<HaccpPlan> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const plan = await this.planRepository.findOne({ where: whereCondition });
    if (!plan) {
      throw new NotFoundException(`HACCP Plan with ID "${id}" not found or unauthorized.`);
    }

    return plan;
  }

  /**
   * Create a new draft HACCP plan (v1)
   */
  async create(dto: CreateHaccpPlanDto, tenant: TenantContext): Promise<HaccpPlan> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to create a HACCP plan.');
    }

    const plan = this.planRepository.create({
      name: dto.name,
      branchId: dto.branchId || tenant.branchId,
      organizationId: tenant.organizationId,
      version: 1,
      status: HaccpPlanStatus.DRAFT,
      effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      createdBy: tenant.userId,
    });

    return this.planRepository.save(plan);
  }

  /**
   * Update plan details.
   * NON-DESTRUCTIVE GUARANTEE: If status is APPROVED or ACTIVE, never overwrite!
   * Automatically branches into a new DRAFT version instead.
   */
  async update(
    id: string,
    dto: UpdateHaccpPlanDto,
    tenant: TenantContext,
  ): Promise<HaccpPlan> {
    const plan = await this.findById(id, tenant);

    // Immutable Versioning Check: APPROVED or ACTIVE plans cannot be destructively mutated
    if (
      plan.status === HaccpPlanStatus.APPROVED ||
      plan.status === HaccpPlanStatus.ACTIVE
    ) {
      return this.createNewVersion(id, dto, tenant);
    }

    // Direct update for DRAFT or IN_REVIEW plans
    if (dto.name) plan.name = dto.name;
    if (dto.branchId !== undefined) plan.branchId = dto.branchId;
    if (dto.effectiveFrom) plan.effectiveFrom = new Date(dto.effectiveFrom);
    if (dto.effectiveTo) plan.effectiveTo = new Date(dto.effectiveTo);

    return this.planRepository.save(plan);
  }

  /**
   * Explicitly create a new version branch of an existing plan (v + 1)
   */
  async createNewVersion(
    id: string,
    dto: UpdateHaccpPlanDto,
    tenant: TenantContext,
  ): Promise<HaccpPlan> {
    const parentPlan = await this.findById(id, tenant);

    const nextVersion = parentPlan.version + 1;

    const newVersionPlan = this.planRepository.create({
      organizationId: parentPlan.organizationId,
      branchId: dto.branchId !== undefined ? dto.branchId : parentPlan.branchId,
      name: dto.name || `${parentPlan.name} (v${nextVersion})`,
      version: nextVersion,
      status: HaccpPlanStatus.DRAFT,
      effectiveFrom: dto.effectiveFrom
        ? new Date(dto.effectiveFrom)
        : parentPlan.effectiveFrom,
      effectiveTo: dto.effectiveTo
        ? new Date(dto.effectiveTo)
        : parentPlan.effectiveTo,
      createdBy: tenant.userId,
    });

    return this.planRepository.save(newVersionPlan);
  }

  /**
   * Transition plan to APPROVED / ACTIVE status.
   * Auto-archives previous ACTIVE plans for the same organization branch.
   */
  async approvePlan(id: string, tenant: TenantContext): Promise<HaccpPlan> {
    const plan = await this.findById(id, tenant);

    if (plan.status === HaccpPlanStatus.ARCHIVED) {
      throw new BadRequestException('Archived plans cannot be re-approved.');
    }

    // Archive previous active plans for this organization & branch
    const whereActive: any = {
      organizationId: plan.organizationId,
      status: HaccpPlanStatus.ACTIVE,
    };
    if (plan.branchId) {
      whereActive.branchId = plan.branchId;
    }

    const previousActivePlans = await this.planRepository.find({
      where: whereActive,
    });

    for (const prev of previousActivePlans) {
      if (prev.id !== plan.id) {
        prev.status = HaccpPlanStatus.ARCHIVED;
        await this.planRepository.save(prev);
      }
    }

    // Mark current plan as ACTIVE & APPROVED
    plan.status = HaccpPlanStatus.ACTIVE;
    plan.approvedBy = tenant.userId;
    plan.approvedAt = new Date();

    return this.planRepository.save(plan);
  }
}
