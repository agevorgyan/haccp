import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Not } from 'typeorm';
import { LogEntry } from '../log-entries/entities/log-entry.entity';
import { Violation, ViolationSeverity, ViolationStatus } from '../violations/entities/violation.entity';
import { CorrectiveAction, CapaStatus } from '../capas/entities/corrective-action.entity';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

export interface AnalyticsOverview {
  complianceScore: number;
  totalLogs30d: number;
  violations30d: number;
  openViolationsCount: number;
  openViolationsBySeverity: Record<ViolationSeverity, number>;
  activeCapasCount: number;
}

export interface DailyTrendItem {
  date: string;
  logsCount: number;
  violationsCount: number;
  complianceRate: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(LogEntry)
    private readonly logEntryRepository: Repository<LogEntry>,
    @InjectRepository(Violation)
    private readonly violationRepository: Repository<Violation>,
    @InjectRepository(CorrectiveAction)
    private readonly capaRepository: Repository<CorrectiveAction>,
  ) {}

  /**
   * Executive Compliance Overview (30-day compliance score, open violations by severity, active CAPAs)
   */
  async getOverview(tenant: TenantContext): Promise<AnalyticsOverview> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const orgFilter = tenant.organizationId && !isSuperAdmin ? { organizationId: tenant.organizationId } : {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total logs in last 30 days
    const totalLogs30d = await this.logEntryRepository.count({
      where: {
        ...orgFilter,
        createdAt: Between(thirtyDaysAgo, new Date()),
      },
    });

    // Total violations in last 30 days
    const violations30d = await this.violationRepository.count({
      where: {
        ...orgFilter,
        detectedAt: Between(thirtyDaysAgo, new Date()),
      },
    });

    // Calculate Overall Compliance Score
    let complianceScore = 100;
    if (totalLogs30d > 0) {
      complianceScore = Math.max(0, Math.min(100, Math.round(100 - (violations30d / totalLogs30d) * 100)));
    } else if (violations30d > 0) {
      complianceScore = 50;
    }

    // Open Violations
    const openViolations = await this.violationRepository.find({
      where: {
        ...orgFilter,
        status: In([ViolationStatus.OPEN, ViolationStatus.ASSIGNED, ViolationStatus.IN_PROGRESS]),
      },
    });

    const openViolationsBySeverity: Record<ViolationSeverity, number> = {
      [ViolationSeverity.CRITICAL]: 0,
      [ViolationSeverity.HIGH]: 0,
      [ViolationSeverity.MEDIUM]: 0,
      [ViolationSeverity.LOW]: 0,
      [ViolationSeverity.INFO]: 0,
    };

    openViolations.forEach((v) => {
      if (v.severity && openViolationsBySeverity[v.severity] !== undefined) {
        openViolationsBySeverity[v.severity] += 1;
      }
    });

    // Active CAPAs (not RESOLVED and not CLOSED)
    const activeCapasCount = await this.capaRepository.count({
      where: {
        ...orgFilter,
        status: Not(In([CapaStatus.RESOLVED, CapaStatus.CLOSED])),
      },
    });

    return {
      complianceScore,
      totalLogs30d,
      violations30d,
      openViolationsCount: openViolations.length,
      openViolationsBySeverity,
      activeCapasCount,
    };
  }

  /**
   * 14-Day Daily Trends (Daily Log Submissions vs Violation Detections)
   */
  async getTrends(tenant: TenantContext): Promise<DailyTrendItem[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const orgFilter = tenant.organizationId && !isSuperAdmin ? { organizationId: tenant.organizationId } : {};

    const trends: DailyTrendItem[] = [];

    // Aggregate last 14 days
    for (let i = 13; i >= 0; i--) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const dateStr = startOfDay.toISOString().split('T')[0];

      const logsCount = await this.logEntryRepository.count({
        where: {
          ...orgFilter,
          createdAt: Between(startOfDay, endOfDay),
        },
      });

      const violationsCount = await this.violationRepository.count({
        where: {
          ...orgFilter,
          detectedAt: Between(startOfDay, endOfDay),
        },
      });

      let complianceRate = 100;
      if (logsCount > 0) {
        complianceRate = Math.max(0, Math.min(100, Math.round(100 - (violationsCount / logsCount) * 100)));
      } else if (violationsCount > 0) {
        complianceRate = 0;
      }

      trends.push({
        date: dateStr,
        logsCount,
        violationsCount,
        complianceRate,
      });
    }

    return trends;
  }
}
