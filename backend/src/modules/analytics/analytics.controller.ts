import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/v1/analytics/overview
   * Executive compliance overview (30-day compliance score, open violations by severity, active CAPAs)
   */
  @Get('overview')
  async getOverview(@CurrentTenant() tenant: TenantContext) {
    return this.analyticsService.getOverview(tenant);
  }

  /**
   * GET /api/v1/analytics/trends
   * 14-day daily breakdown of log submissions vs automated violations
   */
  @Get('trends')
  async getTrends(@CurrentTenant() tenant: TenantContext) {
    return this.analyticsService.getTrends(tenant);
  }
}
