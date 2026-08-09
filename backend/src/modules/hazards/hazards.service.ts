import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
   * Calculate risk score (Severity x Likelihood) and determine critical CCP requirements
   */
  private calculateRiskMetrics(severity: number, likelihood: number) {
    const riskScore = severity * likelihood;
    const isSignificant = riskScore >= 10;
    const requiresCCP = riskScore >= 10;
    return { riskScore, isSignificant, requiresCCP };
  }

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
        `Hazards can only be added or modified on DRAFT or IN_REVIEW HACCP plans. Plan "${plan.name}" is currently ${plan.status}.`,
      );
    }

    return plan;
  }

  /**
   * Retrieve all hazards for a specific plan, strictly isolated by tenant organization ID
   */
  async findAllByPlan(planId: string | undefined, tenant: TenantContext): Promise<Hazard[]> {
    if (planId && planId !== 'undefined' && planId !== 'null' && planId.trim() !== '') {
      await this.haccpPlansService.findById(planId, tenant);

      return this.hazardRepository.find({
        where: { planId, organizationId: tenant.organizationId },
        order: { riskScore: 'DESC', createdAt: 'DESC' },
      });
    }

    return this.hazardRepository.find({
      where: { organizationId: tenant.organizationId },
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
   * Register a new hazard with automated 5x5 risk assessment
   */
  async create(createHazardDto: CreateHazardDto, tenant: TenantContext): Promise<Hazard> {
    await this.validateParentPlanState(createHazardDto.planId, tenant);

    const { riskScore, isSignificant, requiresCCP } = this.calculateRiskMetrics(
      createHazardDto.severity,
      createHazardDto.likelihood,
    );

    const hazard = this.hazardRepository.create({
      ...createHazardDto,
      organizationId: tenant.organizationId,
      riskScore,
      isSignificant,
      requiresCCP,
    });

    return this.hazardRepository.save(hazard);
  }

  /**
   * Update an existing hazard and recalculate risk score
   */
  async update(id: string, updateHazardDto: UpdateHazardDto, tenant: TenantContext): Promise<Hazard> {
    const hazard = await this.findById(id, tenant);
    await this.validateParentPlanState(hazard.planId, tenant);

    const severity = updateHazardDto.severity ?? hazard.severity;
    const likelihood = updateHazardDto.likelihood ?? hazard.likelihood;

    const { riskScore, isSignificant, requiresCCP } = this.calculateRiskMetrics(
      severity,
      likelihood,
    );

    Object.assign(hazard, {
      ...updateHazardDto,
      riskScore,
      isSignificant,
      requiresCCP,
    });

    return this.hazardRepository.save(hazard);
  }

  /**
   * Soft-delete a hazard record
   */
  async delete(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const hazard = await this.findById(id, tenant);
    await this.validateParentPlanState(hazard.planId, tenant);

    await this.hazardRepository.softDelete(id);
    return { success: true, id };
  }
}
