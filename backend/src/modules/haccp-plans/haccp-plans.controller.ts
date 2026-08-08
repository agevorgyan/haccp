import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HaccpPlansService } from './haccp-plans.service';
import { CreateHaccpPlanDto } from './dto/create-haccp-plan.dto';
import { UpdateHaccpPlanDto } from './dto/update-haccp-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('haccp-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
export class HaccpPlansController {
  constructor(private readonly haccpPlansService: HaccpPlansService) {}

  /**
   * GET /api/v1/haccp-plans
   * Retrieve list of HACCP plans for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.haccpPlansService.findAll(tenant);
  }

  /**
   * GET /api/v1/haccp-plans/:id
   * Retrieve specific HACCP plan details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.haccpPlansService.findById(id, tenant);
  }

  /**
   * POST /api/v1/haccp-plans
   * Create a new draft HACCP plan (v1)
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('HACCP_PLAN_CREATED', 'HaccpPlan')
  async create(
    @Body() dto: CreateHaccpPlanDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.haccpPlansService.create(dto, tenant);
  }

  /**
   * PUT /api/v1/haccp-plans/:id
   * Update plan details or automatically generate new draft version if plan is active
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('HACCP_PLAN_UPDATED', 'HaccpPlan')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHaccpPlanDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.haccpPlansService.update(id, dto, tenant);
  }

  /**
   * POST /api/v1/haccp-plans/:id/version
   * Create a new version branch (v + 1) from an existing plan
   */
  @Post(':id/version')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('HACCP_PLAN_VERSION_CREATED', 'HaccpPlan')
  async createNewVersion(
    @Param('id') id: string,
    @Body() dto: UpdateHaccpPlanDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.haccpPlansService.createNewVersion(id, dto, tenant);
  }

  /**
   * POST /api/v1/haccp-plans/:id/approve
   * Transition plan to APPROVED & ACTIVE status
   */
  @Post(':id/approve')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('HACCP_PLAN_APPROVED', 'HaccpPlan')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  async approvePlan(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.haccpPlansService.approvePlan(id, tenant);
  }
}
