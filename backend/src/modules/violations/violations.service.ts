import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Violation, ViolationSeverity, ViolationStatus } from './entities/violation.entity';
import { CreateViolationDto } from './dto/create-violation.dto';
import { UpdateViolationStatusDto } from './dto/update-violation-status.dto';
import { LogEntriesService } from '../log-entries/log-entries.service';
import { CcpsService } from '../ccps/ccps.service';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ViolationsService {
  constructor(
    @InjectRepository(Violation)
    private readonly violationRepository: Repository<Violation>,
    @Inject(forwardRef(() => LogEntriesService))
    private readonly logEntriesService: LogEntriesService,
    private readonly ccpsService: CcpsService,
  ) {}

  /**
   * List all violations for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<Violation[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.violationRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['assignee'],
        order: { detectedAt: 'DESC' },
      });
    }

    return this.violationRepository.find({
      relations: ['assignee'],
      order: { detectedAt: 'DESC' },
    });
  }

  /**
   * Find specific violation by ID
   */
  async findById(id: string, tenant: TenantContext): Promise<Violation> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const violation = await this.violationRepository.findOne({
      where: whereCondition,
      relations: ['assignee'],
    });

    if (!violation) {
      throw new NotFoundException(`Violation with ID "${id}" not found or unauthorized.`);
    }

    return violation;
  }

  /**
   * Create a violation manually or via automated engines
   */
  async create(dto: CreateViolationDto, tenant: TenantContext): Promise<Violation> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to log a violation.');
    }

    const violation = this.violationRepository.create({
      organizationId: tenant.organizationId,
      branchId: dto.branchId || tenant.branchId,
      sourceType: dto.sourceType || 'LOG_ENTRY',
      sourceId: dto.sourceId,
      severity: dto.severity,
      rule: dto.rule,
      actualValue: dto.actualValue,
      expectedValue: dto.expectedValue,
      status: dto.status || ViolationStatus.OPEN,
      assignedTo: dto.assignedTo,
      detectedAt: new Date(),
    });

    return this.violationRepository.save(violation);
  }

  /**
   * Update resolution status and assignment of a violation
   */
  async updateStatus(
    id: string,
    dto: UpdateViolationStatusDto,
    tenant: TenantContext,
  ): Promise<Violation> {
    const violation = await this.findById(id, tenant);

    violation.status = dto.status;
    if (dto.assignedTo !== undefined) {
      violation.assignedTo = dto.assignedTo;
    }

    return this.violationRepository.save(violation);
  }

  /**
   * CENTRALIZED VIOLATION EVALUATION ENGINE
   * Evaluates submitted LogEntry form values against parent LogTemplate CCP thresholds
   */
  async evaluateLogEntry(logEntryId: string, tenant: TenantContext): Promise<Violation[]> {
    const logEntry = await this.logEntriesService.findById(logEntryId, tenant);
    if (!logEntry || !logEntry.template) {
      return [];
    }

    // Check if template links to a CCP
    const ccpId = logEntry.template.ccpId;
    if (!ccpId) {
      return [];
    }

    const ccp = await this.ccpsService.findById(ccpId, tenant);
    if (!ccp) {
      return [];
    }

    const createdViolations: Violation[] = [];
    const formData = logEntry.data || {};

    // Iterate through submitted form fields to extract numerical measurements
    for (const [key, rawVal] of Object.entries(formData)) {
      const numVal = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal));
      if (isNaN(numVal)) continue;

      let isCriticalBreach = false;
      let isWarningBreach = false;
      let ruleName = '';
      let expectedRangeStr = '';

      // 1. Check Critical Limits (CRITICAL Severity)
      if (ccp.criticalLimitMin !== null && ccp.criticalLimitMin !== undefined && numVal < Number(ccp.criticalLimitMin)) {
        isCriticalBreach = true;
        ruleName = `CCP Critical Min Limit Breached (${ccp.code})`;
        expectedRangeStr = `>= ${ccp.criticalLimitMin} ${ccp.unit}`;
      } else if (ccp.criticalLimitMax !== null && ccp.criticalLimitMax !== undefined && numVal > Number(ccp.criticalLimitMax)) {
        isCriticalBreach = true;
        ruleName = `CCP Critical Max Limit Breached (${ccp.code})`;
        expectedRangeStr = `<= ${ccp.criticalLimitMax} ${ccp.unit}`;
      }

      // 2. Check Warning Limits (MEDIUM Severity) if no critical breach
      if (!isCriticalBreach) {
        if (ccp.warningLimitMin !== null && ccp.warningLimitMin !== undefined && numVal < Number(ccp.warningLimitMin)) {
          isWarningBreach = true;
          ruleName = `CCP Warning Min Limit Breached (${ccp.code})`;
          expectedRangeStr = `>= ${ccp.warningLimitMin} ${ccp.unit}`;
        } else if (ccp.warningLimitMax !== null && ccp.warningLimitMax !== undefined && numVal > Number(ccp.warningLimitMax)) {
          isWarningBreach = true;
          ruleName = `CCP Warning Max Limit Breached (${ccp.code})`;
          expectedRangeStr = `<= ${ccp.warningLimitMax} ${ccp.unit}`;
        }
      }

      if (isCriticalBreach || isWarningBreach) {
        const violation = this.violationRepository.create({
          organizationId: logEntry.organizationId,
          branchId: logEntry.branchId,
          sourceType: 'LOG_ENTRY',
          sourceId: logEntry.id,
          severity: isCriticalBreach ? ViolationSeverity.CRITICAL : ViolationSeverity.MEDIUM,
          rule: ruleName,
          actualValue: `${numVal} ${ccp.unit}`,
          expectedValue: expectedRangeStr,
          status: ViolationStatus.OPEN,
          detectedAt: new Date(),
        });

        const saved = await this.violationRepository.save(violation);
        createdViolations.push(saved);
      }
    }

    return createdViolations;
  }
}
