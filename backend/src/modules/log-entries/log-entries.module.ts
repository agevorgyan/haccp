import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntry } from './entities/log-entry.entity';
import { LogEntriesService } from './log-entries.service';
import { LogEntriesController } from './log-entries.controller';
import { LogTemplatesModule } from '../log-templates/log-templates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogEntry]),
    LogTemplatesModule,
  ],
  controllers: [LogEntriesController],
  providers: [LogEntriesService],
  exports: [LogEntriesService],
})
export class LogEntriesModule {}
