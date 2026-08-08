import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { AUDIT_LOG_KEY, AuditLogOptions } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    // If method is not decorated with @AuditLog, pass through without auditing
    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const actor = user?.userId || 'SYSTEM';
    const organizationId = user?.organizationId || '';

    const ip =
      (request.headers['x-forwarded-for'] as string) ||
      request.ip ||
      request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'] as string;
    const entityId = request.params?.id || request.body?.id;
    const oldValue = request.body ? { ...request.body } : undefined;

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const resolvedEntityId = entityId || result?.id || result?.data?.id;
          const newValue = result && typeof result === 'object' ? result : undefined;

          await this.auditService.logEvent({
            organizationId,
            actor,
            action: auditOptions.action,
            entity: auditOptions.entity,
            entityId: resolvedEntityId,
            oldValue,
            newValue,
            ip: typeof ip === 'string' ? ip : String(ip || ''),
            userAgent,
          });
        } catch (err) {
          // Prevent audit logging failures from crashing API responses
          console.warn('AuditInterceptor error during event dispatch:', err);
        }
      }),
    );
  }
}
