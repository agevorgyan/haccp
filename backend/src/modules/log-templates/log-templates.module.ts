import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogTemplate } from './entities/log-template.entity';
import { LogTemplatesService } from './log-templates.service';
import { LogTemplatesController } from './log-templates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LogTemplate])],
  controllers: [LogTemplatesController],
  providers: [LogTemplatesService],
  exports: [LogTemplatesService],
})
export class LogTemplatesModule {}
