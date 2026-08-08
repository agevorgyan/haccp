import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntry, LogEntryStatus } from './entities/log-entry.entity';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto';
import { LogTemplatesService } from '../log-templates/log-templates.service';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class LogEntriesService {
  constructor(
    @InjectRepository(LogEntry)
    private readonly logEntryRepository: Repository<LogEntry>,
    private readonly logTemplatesService: LogTemplatesService,
  ) {}

  /**
   * List all log entries for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<LogEntry[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.logEntryRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['template', 'user'],
        order: { timestamp: 'DESC', createdAt: 'DESC' },
      });
    }

    return this.logEntryRepository.find({
      relations: ['template', 'user'],
      order: { timestamp: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Find specific log entry by ID with tenant boundary checks
   */
  async findById(id: string, tenant: TenantContext): Promise<LogEntry> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const logEntry = await this.logEntryRepository.findOne({
      where: whereCondition,
      relations: ['template', 'user'],
    });

    if (!logEntry) {
      throw new NotFoundException(`Log Entry with ID "${id}" not found or unauthorized.`);
    }

    return logEntry;
  }

  /**
   * Submit a new journal log entry
   */
  async create(dto: CreateLogEntryDto, tenant: TenantContext): Promise<LogEntry> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to submit a log entry.');
    }

    // 1. Fetch template to capture current templateVersion snapshot
    const template = await this.logTemplatesService.findById(dto.templateId, tenant);

    // 2. Build and save entry
    const entry = this.logEntryRepository.create({
      organizationId: tenant.organizationId,
      branchId: dto.branchId || tenant.branchId,
      templateId: template.id,
      templateVersion: template.version,
      userId: tenant.userId,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      shiftId: dto.shiftId,
      status: dto.status || LogEntryStatus.SUBMITTED,
      data: dto.data,
      location: dto.location,
      device: dto.device,
    });

    return this.logEntryRepository.save(entry);
  }

  /**
   * Update log entry.
   * STRICT IMMUTABILITY ENGINE: SUBMITTED or CORRECTED records are immutable and cannot be overwritten!
   */
  async update(
    id: string,
    dto: UpdateLogEntryDto,
    tenant: TenantContext,
  ): Promise<LogEntry> {
    const entry = await this.findById(id, tenant);

    // Immutability Check: SUBMITTED or CORRECTED journal entries cannot be edited
    if (
      entry.status === LogEntryStatus.SUBMITTED ||
      entry.status === LogEntryStatus.CORRECTED
    ) {
      throw new ForbiddenException(
        `Log Entry "${id}" is in ${entry.status} status and is an immutable audit record. Direct edits are prohibited by HACCP compliance rules.`,
      );
    }

    // Allow updating DRAFT entries
    if (dto.data) entry.data = dto.data;
    if (dto.shiftId !== undefined) entry.shiftId = dto.shiftId;
    if (dto.location !== undefined) entry.location = dto.location;
    if (dto.device !== undefined) entry.device = dto.device;
    if (dto.status) entry.status = dto.status;

    return this.logEntryRepository.save(entry);
  }

  /**
   * Remove a DRAFT log entry
   */
  async remove(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const entry = await this.findById(id, tenant);

    if (entry.status !== LogEntryStatus.DRAFT) {
      throw new ForbiddenException(
        `Log Entry "${id}" is ${entry.status} and cannot be deleted. Compliance records must remain in audit trails.`,
      );
    }

    await this.logEntryRepository.remove(entry);
    return { success: true, id };
  }
}
