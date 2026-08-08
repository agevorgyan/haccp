import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrectionRequest } from './entities/correction-request.entity';
import { CorrectionRequestsService } from './correction-requests.service';
import { CorrectionRequestsController } from './correction-requests.controller';
import { LogEntriesModule } from '../log-entries/log-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorrectionRequest]),
    LogEntriesModule,
  ],
  controllers: [CorrectionRequestsController],
  providers: [CorrectionRequestsService],
  exports: [CorrectionRequestsService],
})
export class CorrectionRequestsModule {}
