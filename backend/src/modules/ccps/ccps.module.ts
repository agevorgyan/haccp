import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ccp } from './entities/ccp.entity';
import { CcpsService } from './ccps.service';
import { CcpsController } from './ccps.controller';
import { HaccpPlansModule } from '../haccp-plans/haccp-plans.module';
import { HazardsModule } from '../hazards/hazards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ccp]),
    HaccpPlansModule,
    HazardsModule,
  ],
  controllers: [CcpsController],
  providers: [CcpsService],
  exports: [CcpsService],
})
export class CcpsModule {}
