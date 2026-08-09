import { Controller, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /api/v1/ai/chat
   * Food Safety AI Copilot endpoint guarded strictly by tenant isolation
   */
  @Post('chat')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('AI_COPILOT_QUERY', 'Analytics')
  async chat(
    @Body() dto: ChatDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.aiService.chat(dto, tenant);
  }
}
