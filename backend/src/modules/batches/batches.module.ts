import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ReceivingModule } from '../receiving/receiving.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch]),
    SuppliersModule,
    ReceivingModule,
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
