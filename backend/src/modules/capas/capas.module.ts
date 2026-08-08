import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrectiveAction } from './entities/corrective-action.entity';
import { CapasService } from './capas.service';
import { CapasController } from './capas.controller';
import { ViolationsModule } from '../violations/violations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorrectiveAction]),
    ViolationsModule,
  ],
  controllers: [CapasController],
  providers: [CapasService],
  exports: [CapasService],
})
export class CapasModule {}
