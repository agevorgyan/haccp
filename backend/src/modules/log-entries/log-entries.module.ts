import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntry } from './entities/log-entry.entity';
import { LogEntriesService } from './log-entries.service';
import { LogEntriesController } from './log-entries.controller';
import { LogTemplatesModule } from '../log-templates/log-templates.module';
import { ViolationsModule } from '../violations/violations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogEntry]),
    LogTemplatesModule,
    forwardRef(() => ViolationsModule),
  ],
  controllers: [LogEntriesController],
  providers: [LogEntriesService],
  exports: [LogEntriesService],
})
export class LogEntriesModule {}
