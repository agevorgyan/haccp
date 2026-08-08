import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaccpPlan } from './entities/haccp-plan.entity';
import { HaccpPlansService } from './haccp-plans.service';
import { HaccpPlansController } from './haccp-plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HaccpPlan])],
  controllers: [HaccpPlansController],
  providers: [HaccpPlansService],
  exports: [HaccpPlansService],
})
export class HaccpPlansModule {}
