import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivingLog } from './entities/receiving-log.entity';
import { ReceivingService } from './receiving.service';
import { ReceivingController } from './receiving.controller';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReceivingLog]),
    SuppliersModule,
  ],
  controllers: [ReceivingController],
  providers: [ReceivingService],
  exports: [ReceivingService],
})
export class ReceivingModule {}
