import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

export interface TenantContext {
  userId: string;
  phone: string;
  role: UserRole;
  organizationId: string;
  branchId?: string;
}

/**
 * Custom NestJS Param Decorator @CurrentTenant()
 * Safely extracts validated tenant context (userId, role, organizationId, branchId) directly from req.user
 * without trusting client request body payloads.
 */
export const CurrentTenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext): TenantContext | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as TenantContext;
    return data ? user?.[data] : user;
  },
);
