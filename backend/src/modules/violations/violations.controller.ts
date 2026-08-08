import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ViolationsService } from './violations.service';
import { CreateViolationDto } from './dto/create-violation.dto';
import { UpdateViolationStatusDto } from './dto/update-violation-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('violations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  /**
   * GET /api/v1/violations
   * Retrieve list of violations for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.violationsService.findAll(tenant);
  }

  /**
   * GET /api/v1/violations/:id
   * Retrieve specific violation details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.violationsService.findById(id, tenant);
  }

  /**
   * POST /api/v1/violations
   * Manually record a compliance violation
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('VIOLATION_CREATED', 'Violation')
  async create(
    @Body() dto: CreateViolationDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.violationsService.create(dto, tenant);
  }

  /**
   * PATCH /api/v1/violations/:id/status
   * Update resolution status or assignment of a violation
   */
  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('VIOLATION_UPDATED', 'Violation')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateViolationStatusDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.violationsService.updateStatus(id, dto, tenant);
  }
}
