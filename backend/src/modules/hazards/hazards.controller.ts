import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HazardsService } from './hazards.service';
import { CreateHazardDto } from './dto/create-hazard.dto';
import { UpdateHazardDto } from './dto/update-hazard.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('hazards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
export class HazardsController {
  constructor(private readonly hazardsService: HazardsService) {}

  /**
   * GET /api/v1/hazards?planId=...
   * Retrieve list of hazards associated with a target HACCP plan (or all hazards for tenant)
   */
  @Get()
  async findAllByPlan(
    @Query('planId') planId: string | undefined,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.hazardsService.findAllByPlan(planId, tenant);
  }

  /**
   * GET /api/v1/hazards/:id
   * Retrieve specific hazard details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.hazardsService.findById(id, tenant);
  }

  /**
   * POST /api/v1/hazards
   * Register a new hazard and auto-compute risk score
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('HAZARD_CREATED', 'Hazard')
  async create(
    @Body() createHazardDto: CreateHazardDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.hazardsService.create(createHazardDto, tenant);
  }

  /**
   * PUT /api/v1/hazards/:id
   * Update hazard parameters and re-calculate risk score
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('HAZARD_UPDATED', 'Hazard')
  async update(
    @Param('id') id: string,
    @Body() updateHazardDto: UpdateHazardDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.hazardsService.update(id, updateHazardDto, tenant);
  }

  /**
   * DELETE /api/v1/hazards/:id
   * Soft delete hazard record
   */
  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('HAZARD_DELETED', 'Hazard')
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.hazardsService.delete(id, tenant);
  }
}
