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
import { LogTemplatesService } from './log-templates.service';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('log-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
export class LogTemplatesController {
  constructor(private readonly logTemplatesService: LogTemplatesService) {}

  /**
   * GET /api/v1/log-templates
   * Retrieve list of log templates for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.logTemplatesService.findAll(tenant);
  }

  /**
   * GET /api/v1/log-templates/:id
   * Retrieve specific log template details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.logTemplatesService.findById(id, tenant);
  }

  /**
   * POST /api/v1/log-templates
   * Create a new dynamic log template form
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('LOG_TEMPLATE_CREATED', 'LogTemplate')
  async create(
    @Body() dto: CreateLogTemplateDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.logTemplatesService.create(dto, tenant);
  }

  /**
   * PUT /api/v1/log-templates/:id
   * Update template structure (automatically branches new version if template is active)
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('LOG_TEMPLATE_UPDATED', 'LogTemplate')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLogTemplateDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.logTemplatesService.update(id, dto, tenant);
  }

  /**
   * DELETE /api/v1/log-templates/:id
   * Delete log template entry
   */
  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('LOG_TEMPLATE_DELETED', 'LogTemplate')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.logTemplatesService.remove(id, tenant);
  }
}
