import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hazard } from './entities/hazard.entity';
import { CreateHazardDto } from './dto/create-hazard.dto';
import { UpdateHazardDto } from './dto/update-hazard.dto';
import { HaccpPlansService } from '../haccp-plans/haccp-plans.service';
import { HaccpPlanStatus } from '../haccp-plans/entities/haccp-plan.entity';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class HazardsService {
  constructor(
    @InjectRepository(Hazard)
    private readonly hazardRepository: Repository<Hazard>,
    private readonly haccpPlansService: HaccpPlansService,
  ) {}

  /**
   * Automatically calculate 5x5 matrix risk score and significance/CCP status
   */
  private calculateRiskMetrics(severity: number, likelihood: number) {
    const riskScore = severity * likelihood;
    const isSignificant = riskScore >= 10;
    const requiresCCP = isSignificant;
    return { riskScore, isSignificant, requiresCCP };
  }

  /**
   * Validate that the target HACCP Plan belongs to tenant and is in editable status (DRAFT or IN_REVIEW)
   */
  private async validateParentPlanState(planId: string, tenant: TenantContext) {
    const plan = await this.haccpPlansService.findById(planId, tenant);

    if (
      plan.status !== HaccpPlanStatus.DRAFT &&
      plan.status !== HaccpPlanStatus.IN_REVIEW
    ) {
      throw new BadRequestException(
        `Hazards can only be added or modified on DRAFT or IN_REVIEW HACCP plans. Plan "${plan.name}" is currently ${plan.status}.`,
      );
    }

    return plan;
  }

  /**
   * Retrieve all hazards for a specific plan, strictly isolated by tenant organization ID
   */
  async findAllByPlan(planId: string, tenant: TenantContext): Promise<Hazard[]> {
    // Validate parent plan ownership first
    await this.haccpPlansService.findById(planId, tenant);

    return this.hazardRepository.find({
      where: { planId, organizationId: tenant.organizationId },
      order: { riskScore: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Find specific hazard by ID with tenant organization boundary enforcement
   */
  async findById(id: string, tenant: TenantContext): Promise<Hazard> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const hazard = await this.hazardRepository.findOne({
      where: whereCondition,
      relations: ['plan'],
    });

    if (!hazard) {
      throw new NotFoundException(`Hazard with ID "${id}" not found or unauthorized.`);
    }

    return hazard;
  }

  /**
   * Create a new hazard attached to a HACCP plan
   */
  async create(dto: CreateHazardDto, tenant: TenantContext): Promise<Hazard> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to register a hazard.');
    }

    // 1. Verify plan ownership and editable state (DRAFT / IN_REVIEW)
    const plan = await this.validateParentPlanState(dto.planId, tenant);

    // 2. Compute 5x5 matrix risk score & CCP flags
    const { riskScore, isSignificant, requiresCCP } = this.calculateRiskMetrics(
      dto.severity,
      dto.likelihood,
    );

    // 3. Instantiate and persist hazard
    const hazard = this.hazardRepository.create({
      organizationId: plan.organizationId,
      planId: plan.id,
      processStepId: dto.processStepId,
      category: dto.category,
      description: dto.description,
      source: dto.source,
      preventiveMeasures: dto.preventiveMeasures,
      severity: dto.severity,
      likelihood: dto.likelihood,
      riskScore,
      isSignificant,
      requiresCCP,
    });

    return this.hazardRepository.save(hazard);
  }

  /**
   * Update an existing hazard with automatic recalculation of risk score & parent plan status checks
   */
  async update(
    id: string,
    dto: UpdateHazardDto,
    tenant: TenantContext,
  ): Promise<Hazard> {
    const hazard = await this.findById(id, tenant);

    // Verify parent plan editable status (DRAFT / IN_REVIEW)
    await this.validateParentPlanState(hazard.planId, tenant);

    if (dto.category) hazard.category = dto.category;
    if (dto.description) hazard.description = dto.description;
    if (dto.source !== undefined) hazard.source = dto.source;
    if (dto.preventiveMeasures !== undefined) hazard.preventiveMeasures = dto.preventiveMeasures;
    if (dto.processStepId !== undefined) hazard.processStepId = dto.processStepId;

    if (dto.severity !== undefined) hazard.severity = dto.severity;
    if (dto.likelihood !== undefined) hazard.likelihood = dto.likelihood;

    // Recalculate 5x5 risk score metrics
    const { riskScore, isSignificant, requiresCCP } = this.calculateRiskMetrics(
      hazard.severity,
      hazard.likelihood,
    );

    hazard.riskScore = riskScore;
    hazard.isSignificant = isSignificant;
    hazard.requiresCCP = requiresCCP;

    return this.hazardRepository.save(hazard);
  }

  /**
   * Delete a hazard entry from a DRAFT/IN_REVIEW plan
   */
  async remove(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const hazard = await this.findById(id, tenant);

    // Verify parent plan editable status
    await this.validateParentPlanState(hazard.planId, tenant);

    await this.hazardRepository.remove(hazard);
    return { success: true, id };
  }
}
