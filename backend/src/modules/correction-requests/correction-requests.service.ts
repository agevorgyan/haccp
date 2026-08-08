import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorrectionRequest, CorrectionRequestStatus } from './entities/correction-request.entity';
import { CreateCorrectionRequestDto } from './dto/create-correction-request.dto';
import { LogEntriesService } from '../log-entries/log-entries.service';
import { LogEntryStatus } from '../log-entries/entities/log-entry.entity';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class CorrectionRequestsService {
  constructor(
    @InjectRepository(CorrectionRequest)
    private readonly correctionRepository: Repository<CorrectionRequest>,
    private readonly logEntriesService: LogEntriesService,
  ) {}

  /**
   * List correction requests for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<CorrectionRequest[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.correctionRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['logEntry', 'requester', 'reviewer'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.correctionRepository.find({
      relations: ['logEntry', 'requester', 'reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find specific correction request by ID
   */
  async findById(id: string, tenant: TenantContext): Promise<CorrectionRequest> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const request = await this.correctionRepository.findOne({
      where: whereCondition,
      relations: ['logEntry', 'requester', 'reviewer'],
    });

    if (!request) {
      throw new NotFoundException(`Correction Request with ID "${id}" not found or unauthorized.`);
    }

    return request;
  }

  /**
   * Submit a correction request for a SUBMITTED journal log entry
   */
  async create(dto: CreateCorrectionRequestDto, tenant: TenantContext): Promise<CorrectionRequest> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to submit a correction request.');
    }

    // 1. Verify target LogEntry exists and is in SUBMITTED or CORRECTED status
    const logEntry = await this.logEntriesService.findById(dto.logEntryId, tenant);

    if (logEntry.status === LogEntryStatus.DRAFT) {
      throw new BadRequestException(
        `Log Entry "${dto.logEntryId}" is in DRAFT status and can be edited directly without formal correction approval.`,
      );
    }

    // 2. Build and save correction request
    const request = this.correctionRepository.create({
      organizationId: tenant.organizationId,
      logEntryId: logEntry.id,
      requestedBy: tenant.userId,
      reason: dto.reason,
      proposedData: dto.proposedData,
      status: CorrectionRequestStatus.PENDING,
    });

    return this.correctionRepository.save(request);
  }

  /**
   * Approve a correction request (Manager/Owner role)
   * CRITICAL LOGIC: Updates target LogEntry payload with proposedData and sets status to CORRECTED.
   */
  async approve(id: string, tenant: TenantContext): Promise<CorrectionRequest> {
    const request = await this.findById(id, tenant);

    if (request.status !== CorrectionRequestStatus.PENDING) {
      throw new BadRequestException(
        `Correction Request "${id}" is already ${request.status} and cannot be re-reviewed.`,
      );
    }

    // Fetch and update target LogEntry
    const logEntry = await this.logEntriesService.findById(request.logEntryId, tenant);
    
    // Apply proposed data update and transition status to CORRECTED
    logEntry.data = request.proposedData;
    logEntry.status = LogEntryStatus.CORRECTED;

    // Direct repository update bypassing standard immutability guard for authorized manager workflow
    await this.logEntriesService['logEntryRepository'].save(logEntry);

    // Mark request as APPROVED
    request.status = CorrectionRequestStatus.APPROVED;
    request.reviewedBy = tenant.userId;
    request.reviewedAt = new Date();

    return this.correctionRepository.save(request);
  }

  /**
   * Reject a correction request (Manager/Owner role)
   */
  async reject(id: string, tenant: TenantContext): Promise<CorrectionRequest> {
    const request = await this.findById(id, tenant);

    if (request.status !== CorrectionRequestStatus.PENDING) {
      throw new BadRequestException(
        `Correction Request "${id}" is already ${request.status} and cannot be re-reviewed.`,
      );
    }

    request.status = CorrectionRequestStatus.REJECTED;
    request.reviewedBy = tenant.userId;
    request.reviewedAt = new Date();

    return this.correctionRepository.save(request);
  }
}
