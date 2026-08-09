import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReceivingService } from './receiving.service';
import { CreateReceivingLogDto } from './dto/create-receiving-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('receiving')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
export class ReceivingController {
  constructor(private readonly receivingService: ReceivingService) {}

  /**
   * GET /api/v1/receiving
   * Retrieve delivery receiving logs for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.receivingService.findAll(tenant);
  }

  /**
   * GET /api/v1/receiving/:id
   * Retrieve specific delivery inspection log details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.receivingService.findById(id, tenant);
  }

  /**
   * POST /api/v1/receiving
   * Log a new food supply delivery inspection
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('RECEIVING_LOG_CREATED', 'ReceivingLog')
  async logInspection(
    @Body() dto: CreateReceivingLogDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.receivingService.logInspection(dto, tenant);
  }
}
