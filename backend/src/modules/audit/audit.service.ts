import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from './entities/audit-event.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditEvent)
    private readonly auditRepository: Repository<AuditEvent>,
  ) {}

  /**
   * Write an immutable audit log record to PostgreSQL
   */
  async logEvent(eventData: Partial<AuditEvent>): Promise<AuditEvent | null> {
    try {
      const event = this.auditRepository.create(eventData);
      const saved = await this.auditRepository.save(event);
      this.logger.log(
        `Audit record [${saved.id}] created for actor ${saved.actor} (${saved.action} ${saved.entity}:${saved.entityId || 'N/A'})`,
      );
      return saved;
    } catch (err: any) {
      this.logger.error(`Failed to record audit log event: ${err.message}`, err.stack);
      return null;
    }
  }

  /**
   * Fetch audit logs for an organization tenant
   */
  async findByOrganization(organizationId: string, limit = 100): Promise<AuditEvent[]> {
    return this.auditRepository.find({
      where: { organizationId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
