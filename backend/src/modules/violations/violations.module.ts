import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Violation } from './entities/violation.entity';
import { ViolationsService } from './violations.service';
import { ViolationsController } from './violations.controller';
import { LogEntriesModule } from '../log-entries/log-entries.module';
import { CcpsModule } from '../ccps/ccps.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Violation]),
    forwardRef(() => LogEntriesModule),
    CcpsModule,
  ],
  controllers: [ViolationsController],
  providers: [ViolationsService],
  exports: [ViolationsService],
})
export class ViolationsModule {}
