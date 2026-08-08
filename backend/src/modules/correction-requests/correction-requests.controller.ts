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
import { CorrectionRequestsService } from './correction-requests.service';
import { CreateCorrectionRequestDto } from './dto/create-correction-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('correction-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CorrectionRequestsController {
  constructor(private readonly correctionService: CorrectionRequestsService) {}

  /**
   * GET /api/v1/correction-requests
   * Retrieve list of correction requests for tenant organization
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.correctionService.findAll(tenant);
  }

  /**
   * GET /api/v1/correction-requests/:id
   * Retrieve specific correction request details
   */
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.correctionService.findById(id, tenant);
  }

  /**
   * POST /api/v1/correction-requests
   * Submit a new correction request for a submitted log entry
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CORRECTION_REQUESTED', 'CorrectionRequest')
  async create(
    @Body() dto: CreateCorrectionRequestDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.correctionService.create(dto, tenant);
  }

  /**
   * PATCH /api/v1/correction-requests/:id/approve
   * Approve correction request and update target LogEntry to CORRECTED (Manager/Owner only)
   */
  @Patch(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CORRECTION_APPROVED', 'CorrectionRequest')
  async approve(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.correctionService.approve(id, tenant);
  }

  /**
   * PATCH /api/v1/correction-requests/:id/reject
   * Reject correction request (Manager/Owner only)
   */
  @Patch(':id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CORRECTION_REJECTED', 'CorrectionRequest')
  async reject(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.correctionService.reject(id, tenant);
  }
}
