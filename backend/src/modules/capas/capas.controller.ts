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
import { CapasService } from './capas.service';
import { CreateCapaDto } from './dto/create-capa.dto';
import { UpdateCapaStatusDto } from './dto/update-capa-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('capas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
export class CapasController {
  constructor(private readonly capasService: CapasService) {}

  /**
   * GET /api/v1/capas
   * Retrieve list of CAPA actions for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.capasService.findAll(tenant);
  }

  /**
   * GET /api/v1/capas/:id
   * Retrieve specific CAPA action details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.capasService.findById(id, tenant);
  }

  /**
   * POST /api/v1/capas
   * Issue a new Corrective and Preventive Action (CAPA)
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CAPA_CREATED', 'CorrectiveAction')
  async create(
    @Body() dto: CreateCapaDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.capasService.create(dto, tenant);
  }

  /**
   * PATCH /api/v1/capas/:id/status
   * Advance CAPA lifecycle status and synchronize linked Violation state
   */
  @Patch(':id/status')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CAPA_UPDATED', 'CorrectiveAction')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCapaStatusDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.capasService.updateStatus(id, dto, tenant);
  }
}
