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
  async findAllByPlan(planId: string | undefined, tenant: TenantContext): Promise<Ccp[]> {
    if (planId && planId !== 'undefined' && planId !== 'null' && planId.trim() !== '') {
      await this.haccpPlansService.findById(planId, tenant);

      return this.ccpRepository.find({
        where: { planId, organizationId: tenant.organizationId },
        relations: ['hazard'],
        order: { code: 'ASC', createdAt: 'DESC' },
      });
    }

    return this.ccpRepository.find({
      where: { organizationId: tenant.organizationId },
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
   * Create new Critical Control Point with limits validation
   */
  async create(createCcpDto: CreateCcpDto, tenant: TenantContext): Promise<Ccp> {
    await this.validateParentPlanState(createCcpDto.planId, tenant);
    await this.validateHazardRequirement(createCcpDto.hazardId, createCcpDto.planId, tenant);

    const ccp = this.ccpRepository.create({
      ...createCcpDto,
      organizationId: tenant.organizationId,
      status: CcpStatus.ACTIVE,
    });

    return this.ccpRepository.save(ccp);
  }

  /**
   * Update existing CCP
   */
  async update(id: string, updateCcpDto: UpdateCcpDto, tenant: TenantContext): Promise<Ccp> {
    const ccp = await this.findById(id, tenant);
    await this.validateParentPlanState(ccp.planId, tenant);

    if (updateCcpDto.hazardId && updateCcpDto.hazardId !== ccp.hazardId) {
      await this.validateHazardRequirement(updateCcpDto.hazardId, ccp.planId, tenant);
    }

    Object.assign(ccp, updateCcpDto);
    return this.ccpRepository.save(ccp);
  }

  /**
   * Soft-delete a CCP
   */
  async delete(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const ccp = await this.findById(id, tenant);
    await this.validateParentPlanState(ccp.planId, tenant);

    await this.ccpRepository.softDelete(id);
    return { success: true, id };
  }
}
