import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorrectiveAction, CapaStatus } from './entities/corrective-action.entity';
import { CreateCapaDto } from './dto/create-capa.dto';
import { UpdateCapaStatusDto } from './dto/update-capa-status.dto';
import { ViolationsService } from '../violations/violations.service';
import { ViolationStatus } from '../violations/entities/violation.entity';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class CapasService {
  constructor(
    @InjectRepository(CorrectiveAction)
    private readonly capaRepository: Repository<CorrectiveAction>,
    private readonly violationsService: ViolationsService,
  ) {}

  /**
   * List all CAPAs for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<CorrectiveAction[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.capaRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['violation', 'assignee', 'approver'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.capaRepository.find({
      relations: ['violation', 'assignee', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find specific CAPA by ID
   */
  async findById(id: string, tenant: TenantContext): Promise<CorrectiveAction> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const capa = await this.capaRepository.findOne({
      where: whereCondition,
      relations: ['violation', 'assignee', 'approver'],
    });

    if (!capa) {
      throw new NotFoundException(`CAPA with ID "${id}" not found or unauthorized.`);
    }

    return capa;
  }

  /**
   * Create a new CAPA tied to a Violation
   */
  async create(dto: CreateCapaDto, tenant: TenantContext): Promise<CorrectiveAction> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to issue a CAPA.');
    }

    // 1. Verify target violation exists
    const violation = await this.violationsService.findById(dto.violationId, tenant);

    // 2. Create CAPA
    const initialStatus = dto.assignedTo ? CapaStatus.ASSIGNED : CapaStatus.OPEN;

    const capa = this.capaRepository.create({
      organizationId: tenant.organizationId,
      branchId: dto.branchId || tenant.branchId,
      violationId: violation.id,
      description: dto.description,
      rootCause: dto.rootCause,
      immediateAction: dto.immediateAction,
      preventiveAction: dto.preventiveAction,
      assignedTo: dto.assignedTo,
      deadline: new Date(dto.deadline),
      status: initialStatus,
    });

    const savedCapa = await this.capaRepository.save(capa);

    // 3. Update linked Violation status
    await this.violationsService.updateStatus(
      violation.id,
      {
        status: ViolationStatus.ASSIGNED,
        assignedTo: dto.assignedTo,
      },
      tenant,
    );

    return savedCapa;
  }

  /**
   * Update CAPA status lifecycle and synchronize linked Violation status
   */
  async updateStatus(
    id: string,
    dto: UpdateCapaStatusDto,
    tenant: TenantContext,
  ): Promise<CorrectiveAction> {
    const capa = await this.findById(id, tenant);

    if (dto.rootCause) {
      capa.rootCause = dto.rootCause;
    }
    if (dto.assignedTo) {
      capa.assignedTo = dto.assignedTo;
    }

    capa.status = dto.status;

    // Track approver if transitioning to RESOLVED or CLOSED
    if (
      dto.status === CapaStatus.RESOLVED ||
      dto.status === CapaStatus.CLOSED ||
      dto.status === CapaStatus.VERIFICATION
    ) {
      capa.approvedBy = tenant.userId;
    }

    const savedCapa = await this.capaRepository.save(capa);

    // Synchronize linked Violation status
    let newViolationStatus: ViolationStatus | null = null;

    switch (dto.status) {
      case CapaStatus.IN_PROGRESS:
        newViolationStatus = ViolationStatus.IN_PROGRESS;
        break;
      case CapaStatus.RESOLVED:
        newViolationStatus = ViolationStatus.RESOLVED;
        break;
      case CapaStatus.CLOSED:
        newViolationStatus = ViolationStatus.CLOSED;
        break;
    }

    if (newViolationStatus) {
      await this.violationsService.updateStatus(
        capa.violationId,
        {
          status: newViolationStatus,
          assignedTo: capa.assignedTo,
        },
        tenant,
      );
    }

    return savedCapa;
  }
}
