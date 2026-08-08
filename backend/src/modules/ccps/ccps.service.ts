import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ccp, CcpStatus } from './entities/ccp.entity';
import { CreateCcpDto } from './dto/create-ccp.dto';
import { UpdateCcpDto } from './dto/update-ccp.dto';
import { HaccpPlansService } from '../haccp-plans/haccp-plans.service';
import { HaccpPlanStatus } from '../haccp-plans/entities/haccp-plan.entity';
import { HazardsService } from '../hazards/hazards.service';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class CcpsService {
  constructor(
    @InjectRepository(Ccp)
    private readonly ccpRepository: Repository<Ccp>,
    private readonly haccpPlansService: HaccpPlansService,
    private readonly hazardsService: HazardsService,
  ) {}

  /**
   * Validate parent HACCP plan status (must be DRAFT or IN_REVIEW)
   */
  private async validateParentPlanState(planId: string, tenant: TenantContext) {
    const plan = await this.haccpPlansService.findById(planId, tenant);

    if (
      plan.status !== HaccpPlanStatus.DRAFT &&
      plan.status !== HaccpPlanStatus.IN_REVIEW
    ) {
      throw new BadRequestException(
        `Critical Control Points (CCPs) can only be added or modified on DRAFT or IN_REVIEW HACCP plans. Plan "${plan.name}" is currently ${plan.status}.`,
      );
    }

    return plan;
  }

  /**
   * Validate that the target hazard belongs to the same plan and requires a CCP
   */
  private async validateHazardRequirement(
    hazardId: string,
    planId: string,
    tenant: TenantContext,
  ) {
    const hazard = await this.hazardsService.findById(hazardId, tenant);

    if (hazard.planId !== planId) {
      throw new BadRequestException(
        `Target hazard "${hazardId}" does not belong to specified HACCP Plan "${planId}".`,
      );
    }

    if (!hazard.requiresCCP) {
      throw new BadRequestException(
        `Hazard "${hazard.description}" (Risk Score: ${hazard.riskScore}) does not require a Critical Control Point (requiresCCP is false).`,
      );
    }

    return hazard;
  }

  /**
   * Retrieve all CCPs for a plan, strictly isolated by tenant organization ID
   */
  async findAllByPlan(planId: string, tenant: TenantContext): Promise<Ccp[]> {
    await this.haccpPlansService.findById(planId, tenant);

    return this.ccpRepository.find({
      where: { planId, organizationId: tenant.organizationId },
      relations: ['hazard'],
      order: { code: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Find specific CCP by ID with tenant organization boundary enforcement
   */
  async findById(id: string, tenant: TenantContext): Promise<Ccp> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const ccp = await this.ccpRepository.findOne({
      where: whereCondition,
      relations: ['plan', 'hazard'],
    });

    if (!ccp) {
      throw new NotFoundException(`CCP with ID "${id}" not found or unauthorized.`);
    }

    return ccp;
  }

  /**
   * Create a new Critical Control Point (CCP) with critical limits
   */
  async create(dto: CreateCcpDto, tenant: TenantContext): Promise<Ccp> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to define a CCP.');
    }

    // 1. Validate parent plan editable state
    const plan = await this.validateParentPlanState(dto.planId, tenant);

    // 2. Validate hazard belongs to plan and requires a CCP
    const hazard = await this.validateHazardRequirement(dto.hazardId, dto.planId, tenant);

    // 3. Create and persist CCP
    const ccp = this.ccpRepository.create({
      organizationId: plan.organizationId,
      planId: plan.id,
      hazardId: hazard.id,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      criticalLimitMin: dto.criticalLimitMin,
      criticalLimitMax: dto.criticalLimitMax,
      warningLimitMin: dto.warningLimitMin,
      warningLimitMax: dto.warningLimitMax,
      unit: dto.unit || '°C',
      monitoringMethod: dto.monitoringMethod,
      monitoringFrequency: dto.monitoringFrequency,
      status: dto.status || CcpStatus.ACTIVE,
    });

    return this.ccpRepository.save(ccp);
  }

  /**
   * Update an existing CCP with plan state verification
   */
  async update(
    id: string,
    dto: UpdateCcpDto,
    tenant: TenantContext,
  ): Promise<Ccp> {
    const ccp = await this.findById(id, tenant);

    // Validate parent plan editable state
    await this.validateParentPlanState(ccp.planId, tenant);

    if (dto.code) ccp.code = dto.code;
    if (dto.name) ccp.name = dto.name;
    if (dto.description !== undefined) ccp.description = dto.description;
    if (dto.criticalLimitMin !== undefined) ccp.criticalLimitMin = dto.criticalLimitMin;
    if (dto.criticalLimitMax !== undefined) ccp.criticalLimitMax = dto.criticalLimitMax;
    if (dto.warningLimitMin !== undefined) ccp.warningLimitMin = dto.warningLimitMin;
    if (dto.warningLimitMax !== undefined) ccp.warningLimitMax = dto.warningLimitMax;
    if (dto.unit) ccp.unit = dto.unit;
    if (dto.monitoringMethod) ccp.monitoringMethod = dto.monitoringMethod;
    if (dto.monitoringFrequency) ccp.monitoringFrequency = dto.monitoringFrequency;
    if (dto.status) ccp.status = dto.status;

    return this.ccpRepository.save(ccp);
  }

  /**
   * Delete a CCP entry from a DRAFT/IN_REVIEW plan
   */
  async remove(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const ccp = await this.findById(id, tenant);

    // Validate parent plan editable state
    await this.validateParentPlanState(ccp.planId, tenant);

    await this.ccpRepository.remove(ccp);
    return { success: true, id };
  }
}
