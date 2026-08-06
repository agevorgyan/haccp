import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * @Roles Decorator
 * Annotates controller routes with required UserRole permissions (e.g. @Roles(UserRole.OWNER, UserRole.MANAGER))
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
