import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogTemplate, LogTemplateStatus } from './entities/log-template.entity';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class LogTemplatesService {
  constructor(
    @InjectRepository(LogTemplate)
    private readonly templateRepository: Repository<LogTemplate>,
  ) {}

  /**
   * List all log templates for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<LogTemplate[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.templateRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['ccp'],
        order: { version: 'DESC', createdAt: 'DESC' },
      });
    }

    return this.templateRepository.find({
      relations: ['ccp'],
      order: { version: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Find specific log template by ID with tenant boundary checks
   */
  async findById(id: string, tenant: TenantContext): Promise<LogTemplate> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const template = await this.templateRepository.findOne({
      where: whereCondition,
      relations: ['ccp'],
    });

    if (!template) {
      throw new NotFoundException(`Log Template with ID "${id}" not found or unauthorized.`);
    }

    return template;
  }

  /**
   * Create a new log template (v1)
   */
  async create(dto: CreateLogTemplateDto, tenant: TenantContext): Promise<LogTemplate> {
    if (!tenant.organizationId && tenant.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tenant organization reference required to build a log template.');
    }

    const template = this.templateRepository.create({
      organizationId: tenant.organizationId,
      branchId: dto.branchId || tenant.branchId,
      ccpId: dto.ccpId,
      name: dto.name,
      description: dto.description,
      fields: dto.fields || [],
      status: dto.status || LogTemplateStatus.DRAFT,
      version: 1,
    });

    return this.templateRepository.save(template);
  }

  /**
   * Update log template details.
   * HISTORICAL PRESERVATION GUARANTEE: If status is ACTIVE, do not overwrite in place.
   * Increment version (version = current + 1) and create a new record.
   */
  async update(
    id: string,
    dto: UpdateLogTemplateDto,
    tenant: TenantContext,
  ): Promise<LogTemplate> {
    const existing = await this.findById(id, tenant);

    // Active Template Versioning Rule: Create new version if updating an ACTIVE template
    if (existing.status === LogTemplateStatus.ACTIVE) {
      return this.createNewVersion(existing, dto, tenant);
    }

    // Direct update for DRAFT templates
    if (dto.name) existing.name = dto.name;
    if (dto.description !== undefined) existing.description = dto.description;
    if (dto.branchId !== undefined) existing.branchId = dto.branchId;
    if (dto.ccpId !== undefined) existing.ccpId = dto.ccpId;
    if (dto.fields) existing.fields = dto.fields;
    if (dto.status) existing.status = dto.status;

    return this.templateRepository.save(existing);
  }

  /**
   * Branch a new version of an ACTIVE template to preserve historical journal entry structures
   */
  private async createNewVersion(
    parent: LogTemplate,
    dto: UpdateLogTemplateDto,
    tenant: TenantContext,
  ): Promise<LogTemplate> {
    const nextVersion = parent.version + 1;

    // Archive current parent template
    parent.status = LogTemplateStatus.ARCHIVED;
    await this.templateRepository.save(parent);

    // Create new version record
    const newVersion = this.templateRepository.create({
      organizationId: parent.organizationId,
      branchId: dto.branchId !== undefined ? dto.branchId : parent.branchId,
      ccpId: dto.ccpId !== undefined ? dto.ccpId : parent.ccpId,
      name: dto.name || parent.name,
      description: dto.description !== undefined ? dto.description : parent.description,
      fields: dto.fields || parent.fields,
      status: dto.status || LogTemplateStatus.ACTIVE,
      version: nextVersion,
    });

    return this.templateRepository.save(newVersion);
  }

  /**
   * Delete log template entry
   */
  async remove(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const template = await this.findById(id, tenant);
    await this.templateRepository.remove(template);
    return { success: true, id };
  }
}
