import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleaningTask } from './entities/cleaning-task.entity';
import { CleaningTasksService } from './cleaning-tasks.service';
import { CleaningTasksController } from './cleaning-tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CleaningTask])],
  controllers: [CleaningTasksController],
  providers: [CleaningTasksService],
  exports: [CleaningTasksService],
})
export class CleaningTasksModule {}
