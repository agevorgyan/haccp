import { SetMetadata } from '@nestjs/common';

export interface AuditLogOptions {
  action: string;
  entity: string;
}

export const AUDIT_LOG_KEY = 'AUDIT_LOG_METADATA';

/**
 * Custom Decorator @AuditLog(action, entity)
 * Attaches metadata to a controller handler for automatic audit log processing.
 * Example: @AuditLog('UPDATE', 'User')
 */
export const AuditLog = (action: string, entity: string) =>
  SetMetadata(AUDIT_LOG_KEY, { action, entity } as AuditLogOptions);
