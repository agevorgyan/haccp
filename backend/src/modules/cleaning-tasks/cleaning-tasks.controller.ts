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
import { CleaningTasksService } from './cleaning-tasks.service';
import { CreateCleaningTaskDto } from './dto/create-cleaning-task.dto';
import { UpdateCleaningTaskDto } from './dto/update-cleaning-task.dto';
import { CompleteCleaningTaskDto } from './dto/complete-cleaning-task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('cleaning-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
export class CleaningTasksController {
  constructor(private readonly cleaningTasksService: CleaningTasksService) {}

  /**
   * GET /api/v1/cleaning-tasks
   * Retrieve list of cleaning tasks for tenant organization
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.cleaningTasksService.findAll(tenant);
  }

  /**
   * GET /api/v1/cleaning-tasks/:id
   * Retrieve specific cleaning task details
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.cleaningTasksService.findById(id, tenant);
  }

  /**
   * POST /api/v1/cleaning-tasks
   * Schedule a new cleaning task protocol
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CLEANING_TASK_CREATED', 'CleaningTask')
  async create(
    @Body() dto: CreateCleaningTaskDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.cleaningTasksService.create(dto, tenant);
  }

  /**
   * PUT /api/v1/cleaning-tasks/:id
   * Update cleaning task definition
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CLEANING_TASK_UPDATED', 'CleaningTask')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCleaningTaskDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.cleaningTasksService.update(id, dto, tenant);
  }

  /**
   * PATCH /api/v1/cleaning-tasks/:id/complete
   * Mark cleaning task as COMPLETED with photo evidence
   */
  @Patch(':id/complete')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CLEANING_TASK_COMPLETED', 'CleaningTask')
  async completeTask(
    @Param('id') id: string,
    @Body() dto: CompleteCleaningTaskDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.cleaningTasksService.completeTask(id, dto, tenant);
  }

  /**
   * PATCH /api/v1/cleaning-tasks/:id/verify
   * Verify completed cleaning task (Manager/Owner only)
   */
  @Patch(':id/verify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CLEANING_TASK_VERIFIED', 'CleaningTask')
  async verifyTask(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.cleaningTasksService.verifyTask(id, tenant);
  }

  /**
   * DELETE /api/v1/cleaning-tasks/:id
   * Delete a cleaning task protocol entry
   */
  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('CLEANING_TASK_DELETED', 'CleaningTask')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.cleaningTasksService.remove(id, tenant);
  }
}
