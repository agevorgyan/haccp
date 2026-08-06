import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../modules/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../../modules/auth/strategies/jwt.strategy';

/**
 * RolesGuard
 * Evaluates current user's role against required roles defined by @Roles() decorator.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific role restrictions are specified, access is granted
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user }: { user: AuthenticatedUser } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied. No authenticated user role found.');
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `Forbidden resource. Required role(s): [${requiredRoles.join(', ')}]. Your role: ${user.role}`
      );
    }

    return true;
  }
}
