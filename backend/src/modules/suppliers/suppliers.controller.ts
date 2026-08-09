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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  /**
   * GET /api/v1/suppliers
   * Retrieve list of food suppliers for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.suppliersService.findAll(tenant);
  }

  /**
   * GET /api/v1/suppliers/:id
   * Retrieve specific supplier details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.suppliersService.findById(id, tenant);
  }

  /**
   * POST /api/v1/suppliers
   * Register a new food supply chain vendor
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('SUPPLIER_CREATED', 'Supplier')
  async create(
    @Body() dto: CreateSupplierDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.suppliersService.create(dto, tenant);
  }

  /**
   * PUT /api/v1/suppliers/:id
   * Update supplier details
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('SUPPLIER_UPDATED', 'Supplier')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.suppliersService.update(id, dto, tenant);
  }

  /**
   * DELETE /api/v1/suppliers/:id
   * Delete a supplier record
   */
  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('SUPPLIER_DELETED', 'Supplier')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.suppliersService.remove(id, tenant);
  }
}
