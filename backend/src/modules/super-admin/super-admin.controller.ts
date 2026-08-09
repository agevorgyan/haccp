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
import { SuperAdminService } from './super-admin.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateTenantSubscriptionDto } from './dto/update-tenant-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  /**
   * GET /api/v1/super-admin/plans
   * List all available SaaS Subscription Plans
   */
  @Get('plans')
  async getPlans() {
    return this.superAdminService.getPlans();
  }

  /**
   * POST /api/v1/super-admin/plans
   * Create a new SaaS Subscription Plan tier
   */
  @Post('plans')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('SUBSCRIPTION_PLAN_CREATED', 'SubscriptionPlan')
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.superAdminService.createPlan(dto);
  }

  /**
   * GET /api/v1/super-admin/tenants
   * Global Tenant Directory for Super Admin (returns organizations with usage vs plan quotas)
   */
  @Get('tenants')
  async getTenants() {
    return this.superAdminService.getTenants();
  }

  /**
   * PATCH /api/v1/super-admin/tenants/:id/subscription
   * Upgrade/downgrade tenant plan or suspend/activate subscription status
   */
  @Patch('tenants/:id/subscription')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('TENANT_SUBSCRIPTION_UPDATED', 'Organization')
  async updateTenantSubscription(
    @Param('id') id: string,
    @Body() dto: UpdateTenantSubscriptionDto,
  ) {
    return this.superAdminService.updateTenantSubscription(id, dto);
  }
}
