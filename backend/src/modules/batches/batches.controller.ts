import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { DecrementBatchQuantityDto } from './dto/decrement-batch-quantity.dto';
import { UpdateBatchStatusDto } from './dto/update-batch-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('batches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  /**
   * GET /api/v1/batches
   * Retrieve list of lot/batch inventory records for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.batchesService.findAll(tenant);
  }

  /**
   * GET /api/v1/batches/:id
   * Retrieve specific batch record details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.batchesService.findById(id, tenant);
  }

  /**
   * POST /api/v1/batches
   * Register a new lot batch in inventory
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('BATCH_CREATED', 'Batch')
  async create(
    @Body() dto: CreateBatchDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.batchesService.create(dto, tenant);
  }

  /**
   * PUT /api/v1/batches/:id
   * Update batch details
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('BATCH_UPDATED', 'Batch')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBatchDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.batchesService.update(id, dto, tenant);
  }

  /**
   * PATCH /api/v1/batches/:id/decrement
   * Decrement batch quantity as inventory is used
   */
  @Patch(':id/decrement')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('BATCH_UPDATED', 'Batch')
  async decrementQuantity(
    @Param('id') id: string,
    @Body() dto: DecrementBatchQuantityDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.batchesService.decrementQuantity(id, dto, tenant);
  }

  /**
   * PATCH /api/v1/batches/:id/status
   * Update batch status (QUARANTINED, RECALLED, ACTIVE, EXHAUSTED)
   */
  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('BATCH_UPDATED', 'Batch')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBatchStatusDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.batchesService.updateStatus(id, dto, tenant);
  }

  /**
   * DELETE /api/v1/batches/:id
   * Delete a batch record
   */
  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('BATCH_DELETED', 'Batch')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.batchesService.remove(id, tenant);
  }
}
