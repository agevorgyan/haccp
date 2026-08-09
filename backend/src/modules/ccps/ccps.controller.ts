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
import { CcpsService } from './ccps.service';
import { CreateCcpDto } from './dto/create-ccp.dto';
import { UpdateCcpDto } from './dto/update-ccp.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('ccps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
export class CcpsController {
  constructor(private readonly ccpsService: CcpsService) {}

  /**
   * GET /api/v1/ccps?planId=...
   * Retrieve list of Critical Control Points for a target HACCP plan (or all CCPs for tenant)
   */
  @Get()
  async findAllByPlan(
    @Query('planId') planId: string | undefined,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.ccpsService.findAllByPlan(planId, tenant);
  }

  /**
   * GET /api/v1/ccps/:id
   * Retrieve specific CCP details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.ccpsService.findById(id, tenant);
  }

  /**
   * POST /api/v1/ccps
   * Register a new Critical Control Point with critical and warning limits
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CCP_CREATED', 'Ccp')
  async create(
    @Body() createCcpDto: CreateCcpDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.ccpsService.create(createCcpDto, tenant);
  }

  /**
   * PUT /api/v1/ccps/:id
   * Update Critical Control Point limits or monitoring details
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CCP_UPDATED', 'Ccp')
  async update(
    @Param('id') id: string,
    @Body() updateCcpDto: UpdateCcpDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.ccpsService.update(id, updateCcpDto, tenant);
  }

  /**
   * DELETE /api/v1/ccps/:id
   * Remove a Critical Control Point
   */
  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CCP_DELETED', 'Ccp')
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.ccpsService.delete(id, tenant);
  }
}
