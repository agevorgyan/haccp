import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hazard } from './entities/hazard.entity';
import { HazardsService } from './hazards.service';
import { HazardsController } from './hazards.controller';
import { HaccpPlansModule } from '../haccp-plans/haccp-plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hazard]),
    HaccpPlansModule,
  ],
  controllers: [HazardsController],
  providers: [HazardsService],
  exports: [HazardsService],
})
export class HazardsModule {}
