import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntry } from '../log-entries/entities/log-entry.entity';
import { Violation } from '../violations/entities/violation.entity';
import { CorrectiveAction } from '../capas/entities/corrective-action.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntry, Violation, CorrectiveAction])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
