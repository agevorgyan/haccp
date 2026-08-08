import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LogEntriesService } from './log-entries.service';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('log-entries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
export class LogEntriesController {
  constructor(private readonly logEntriesService: LogEntriesService) {}

  /**
   * GET /api/v1/log-entries
   * Retrieve list of journal log entries for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.logEntriesService.findAll(tenant);
  }

  /**
   * GET /api/v1/log-entries/:id
   * Retrieve specific log entry details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.logEntriesService.findById(id, tenant);
  }

  /**
   * POST /api/v1/log-entries
   * Submit a new HACCP journal entry (immutable record)
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('LOG_ENTRY_CREATED', 'LogEntry')
  async create(
    @Body() dto: CreateLogEntryDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.logEntriesService.create(dto, tenant);
  }

  /**
   * PUT /api/v1/log-entries/:id
   * Update DRAFT entry (throws ForbiddenException if entry is SUBMITTED)
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('LOG_ENTRY_UPDATED', 'LogEntry')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLogEntryDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.logEntriesService.update(id, dto, tenant);
  }

  /**
   * DELETE /api/v1/log-entries/:id
   * Remove DRAFT entry
   */
  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('LOG_ENTRY_DELETED', 'LogEntry')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.logEntriesService.remove(id, tenant);
  }
}
